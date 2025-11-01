using SourceDev.API.Middlewares;

namespace SourceDev.API.Extensions
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionMiddleware>();
        }
        public static IApplicationBuilder UseLoggingMiddleware(this IApplicationBuilder app)
        {
            return app.UseMiddleware<LoggingMiddleware>();
        }
        public static IApplicationBuilder UseDynamicCorsMiddleware(this IApplicationBuilder app)
        {
            return app.UseMiddleware<DynamicCorsMiddleware>();
        }
    }
}
