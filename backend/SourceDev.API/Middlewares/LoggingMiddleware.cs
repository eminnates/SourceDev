using System.Diagnostics;

namespace SourceDev.API.Middlewares
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;

        public LoggingMiddleware(ILogger<LoggingMiddleware> logger, RequestDelegate next)
        {
            _logger = logger;
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var method = context.Request.Method;
            var path = context.Request.Path;
            var queryString = context.Request.QueryString;

            _logger.LogInformation("Request: {Method} {Path}{Query}", method, path, queryString);

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var statusCode = context.Response.StatusCode;
                var elapsed = stopwatch.ElapsedMilliseconds;

                // Log at appropriate level based on status code
                if (statusCode >= 500)
                {
                    _logger.LogError("Response: {StatusCode} {Method} {Path} completed in {Elapsed}ms", 
                        statusCode, method, path, elapsed);
                }
                else if (statusCode >= 400)
                {
                    _logger.LogWarning("Response: {StatusCode} {Method} {Path} completed in {Elapsed}ms", 
                        statusCode, method, path, elapsed);
                }
                else
                {
                    _logger.LogInformation("Response: {StatusCode} {Method} {Path} completed in {Elapsed}ms", 
                        statusCode, method, path, elapsed);
                }
            }
        }
    }
}
