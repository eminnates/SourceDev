using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SourceDev.API.Data.Context;
using SourceDev.API.Extensions;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using SourceDev.API.Services.Background;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Load .env file only in Development
if (builder.Environment.IsDevelopment())
{
    DotNetEnv.Env.Load();
}

// Get environment variables (works for both local .env and Railway environment variables)
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL"); // Railway PostgreSQL uses DATABASE_URL
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var jwtExpiration = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES"), out var exp) ? exp : 60;

// Validate required environment variables
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("CONNECTION_STRING or DATABASE_URL not found in environment variables!");
if (string.IsNullOrWhiteSpace(jwtSecret))
    throw new InvalidOperationException("JWT_SECRET_KEY not found in environment variables!");
if (string.IsNullOrWhiteSpace(jwtIssuer))
    throw new InvalidOperationException("JWT_ISSUER not found in environment variables!");
if (string.IsNullOrWhiteSpace(jwtAudience))
    throw new InvalidOperationException("JWT_AUDIENCE not found in environment variables!");

// Only log configuration details in Development
if (builder.Environment.IsDevelopment())
{
    Console.WriteLine("=== CONFIGURATION LOADED ===");
    Console.WriteLine($"JWT Issuer: {jwtIssuer}");
    Console.WriteLine($"JWT Audience: {jwtAudience}");
    Console.WriteLine($"JWT Expiration: {jwtExpiration} minutes");
    Console.WriteLine($"Connection String: {connectionString?.Substring(0, Math.Min(50, connectionString.Length))}...");
    
    var emailHost = Environment.GetEnvironmentVariable("MAIL_HOST");
    if (!string.IsNullOrEmpty(emailHost))
    {
        Console.WriteLine($"mail Host: {emailHost}");
    }
    else
    {
        Console.WriteLine("mail Host: Not configured (using mock)");
    }
    Console.WriteLine("============================");
}

// Database Context Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, sqlOptions =>
    {
        sqlOptions.CommandTimeout(60); // 60 saniye timeout (default 30)
    });
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking); // Global NoTracking
    
    // Only enable sensitive logging in Development
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
builder.Services.AddScoped<IEmailService, EmailService>();

// Background Services
builder.Services.AddSingleton<IViewCountQueue, ViewCountQueue>();
builder.Services.AddHostedService<ViewCountWorker>();

// Identity Configuration
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;

    // User settings
    options.User.RequireUniqueEmail = true;

    // Lockout settings
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

    // Token blacklist
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "A", location = "Program.cs:154", message = "OnTokenValidated entry", data = new { hasAuthHeader = context.Request.Headers.ContainsKey("Authorization"), authHeaderValue = context.Request.Headers["Authorization"].ToString().Substring(0, Math.Min(50, context.Request.Headers["Authorization"].ToString().Length)) }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();
            var authHeader = context.Request.Headers["Authorization"].ToString();
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "A", location = "Program.cs:160", message = "Before token extraction", data = new { authHeaderLength = authHeader.Length, startsWithBearer = authHeader.StartsWith("Bearer "), isEmpty = string.IsNullOrEmpty(authHeader) }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            var token = authHeader.Replace("Bearer ", "");
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "A", location = "Program.cs:164", message = "After token extraction", data = new { tokenLength = token.Length, isEmpty = string.IsNullOrEmpty(token) }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion

            if (await tokenBlacklistService.IsBlacklistedAsync(token))
            {
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "A", location = "Program.cs:168", message = "Token blacklisted", data = new { tokenLength = token.Length }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
                context.Fail("This token has been revoked (logged out).");
            }
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "A", location = "Program.cs:173", message = "OnTokenValidated exit", data = new { tokenValidated = true }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
        }
    };
});

// Add Controllers
builder.Services.AddControllers();

// Add Health Checks for Railway
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString!, name: "postgresql", timeout: TimeSpan.FromSeconds(30));

// AFTER THAT IS DYNAMIC
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Health check endpoint for Railway
app.MapHealthChecks("/health");

// MIDDLEWARE
app.UseLoggingMiddleware();
app.UseExceptionMiddleware();
app.UseDynamicCorsMiddleware();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// OTOMATİK MIGRATION KODU BAŞLANGICI
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // #region agent log
        try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "E", location = "Program.cs:199", message = "Migration start", data = new { }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
        // #endregion
        var context = services.GetRequiredService<AppDbContext>();
        // Veritabanı yoksa oluşturur, varsa eksik migrationları uygular
        context.Database.Migrate(); 
        // #region agent log
        try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "E", location = "Program.cs:203", message = "Migration success", data = new { }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
        // #endregion
        Console.WriteLine("--> Veritabanı migrationları başarıyla uygulandı.");
    }
    catch (Exception ex)
    {
        // #region agent log
        try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "E", location = "Program.cs:207", message = "Migration error", data = new { errorMessage = ex.Message, errorType = ex.GetType().Name }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); System.IO.File.AppendAllText("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
        // #endregion
        Console.WriteLine($"--> Migration sırasında hata oluştu: {ex.Message}");
    }
}
// OTOMATİK MIGRATION KODU BİTİŞİ

app.Run();