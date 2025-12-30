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
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "ExceptionMiddleware.cs:23", message = "Exception caught", data = new { errorType = ex.GetType().Name, errorMessage = ex.Message, hasCorsOrigin = context.Request.Headers.ContainsKey("Origin"), origin = context.Request.Headers["Origin"].ToString() }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
                _logger.LogError(ex, "Unhandled exception occurred");
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "ExceptionMiddleware.cs:28", message = "Before response write", data = new { hasCorsHeaders = context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"), corsHeaderValue = context.Response.Headers.ContainsKey("Access-Control-Allow-Origin") ? context.Response.Headers["Access-Control-Allow-Origin"].ToString() : "none" }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
                
                var response = _env.IsDevelopment()
                    ? new { message = ex.Message, detail = ex.StackTrace }
                    : new { message = "Internal Server Error", detail = "An unexpected error occurred. Please try again later." };
                
                await context.Response.WriteAsJsonAsync(response);
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "ExceptionMiddleware.cs:35", message = "After response write", data = new { hasCorsHeaders = context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"), corsHeaderValue = context.Response.Headers.ContainsKey("Access-Control-Allow-Origin") ? context.Response.Headers["Access-Control-Allow-Origin"].ToString() : "none" }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
            }
        }
    }
}
