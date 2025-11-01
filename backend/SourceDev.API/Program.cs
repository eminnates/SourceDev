using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SourceDev.API.Configuration;
using SourceDev.API.Data.Context;
using SourceDev.API.Extensions;
using SourceDev.API.Models.Entities;
using SourceDev.API.Repositories;
using SourceDev.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

DotNetEnv.Env.Load();

// Read sensitive config from environment variables
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

// JWT Settings (Issuer, Audience, Expiration from config, Secret from env)
var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings");
var jwtIssuer = jwtSettingsSection["Issuer"];
var jwtAudience = jwtSettingsSection["Audience"];
var jwtExpiration = int.TryParse(jwtSettingsSection["ExpirationInMinutes"], out var exp) ? exp : 1440;

// DbContext Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// AutoMapper Configuration
builder.Services.AddAutoMapper(typeof(Program));

// Repository Pattern - Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<ITokenBlacklistService, TokenBlacklistService>();

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
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret ?? "")),
        ClockSkew = TimeSpan.Zero
    };
    
    // Token blacklist kontrolü
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            
            if (await tokenBlacklistService.IsBlacklistedAsync(token))
            {
                context.Fail("This token has been revoked (logged out).");
            }
        }
    };
});


// Add Controllers
builder.Services.AddControllers();


// AFTER THAT IS DYNAMIC
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// MIDDLEWARE
app.UseLoggingMiddleware();
app.UseExceptionMiddleware();
app.UseHttpsRedirection();
app.UseDynamicCorsMiddleware();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();



app.Run();


