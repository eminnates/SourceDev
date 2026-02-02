using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SourceDev.API.Data.Context;
using SourceDev.API.Extensions;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Services.Background;
using System.IO.Compression;
using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Load .env file only in Development
if (builder.Environment.IsDevelopment())
{
    DotNetEnv.Env.Load();
}

// Get environment variables
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var jwtExpiration = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES"), out var exp) ? exp : 60;

// Validate required environment variables
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("CONNECTION_STRING or DATABASE_URL not found!");
if (string.IsNullOrWhiteSpace(jwtSecret))
    throw new InvalidOperationException("JWT_SECRET_KEY not found!");
if (string.IsNullOrWhiteSpace(jwtIssuer))
    throw new InvalidOperationException("JWT_ISSUER not found!");
if (string.IsNullOrWhiteSpace(jwtAudience))
    throw new InvalidOperationException("JWT_AUDIENCE not found!");

// Log config in Development
if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("=== CONFIGURATION LOADED ===");
    Console.WriteLine($"Connection String: {connectionString?.Substring(0, Math.Min(50, connectionString.Length))}...");
    Console.WriteLine("============================");
}

// Database Context Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, sqlOptions =>
    {
        sqlOptions.CommandTimeout(60);
    });
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// AutoMapper Configuration
builder.Services.AddAutoMapper(typeof(Program));

// FluentValidation Configuration
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// --- EKLEMEN GEREKEN KRİTİK SATIR ---
builder.Services.AddHttpClient(); 
// ------------------------------------

// Memory Cache Configuration
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<ICacheService, CacheService>();

// Response Compression Configuration
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "text/json"
    });
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.SmallestSize;
});

// Rate Limiting Configuration
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Global rate limit
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));
    
    // Auth endpoints rate limit (stricter)
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));
    
    // Post creation rate limit
    options.AddPolicy("post-create", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 1
            }));
});

// Repository Pattern - Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IFollowService, FollowService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddSingleton<ITokenBlacklistService, TokenBlacklistService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IReactionService, ReactionService>();

// Background Services
builder.Services.AddSingleton<IViewCountQueue, ViewCountQueue>();
builder.Services.AddHostedService<ViewCountWorker>();

// Identity Configuration
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();
            var authHeader = context.Request.Headers["Authorization"].ToString();
            var token = authHeader.Replace("Bearer ", "");

            if (await tokenBlacklistService.IsBlacklistedAsync(token))
            {
                context.Fail("This token has been revoked (logged out).");
            }
        }
    };
});

builder.Services.AddControllers();

// Add Health Checks for Railway
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString!, name: "postgresql", timeout: TimeSpan.FromSeconds(30));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapHealthChecks("/health");

app.UseResponseCompression();
app.UseLoggingMiddleware();
app.UseExceptionMiddleware();
app.UseDynamicCorsMiddleware();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// OTOMATİK MIGRATION
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate(); 
        Console.WriteLine("--> Veritabanı migrationları başarıyla uygulandı.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> Migration sırasında hata oluştu: {ex.Message}");
    }
}

app.Run();