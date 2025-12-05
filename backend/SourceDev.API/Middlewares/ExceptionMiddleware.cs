using System.Net;

namespace SourceDev.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, RequestDelegate next, IHostEnvironment env)
        {
            _logger = logger;
            _next = next;
            _env = env;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";
                
                var response = _env.IsDevelopment()
                    ? new { message = ex.Message, detail = ex.StackTrace }
                    : new { message = "Internal Server Error", detail = "An unexpected error occurred. Please try again later." };
                
                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
