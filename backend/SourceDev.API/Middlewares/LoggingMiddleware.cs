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
            _logger.LogInformation($"Request:{context.Request.Method}{context.Request.Path}");
            var stopwatch = Stopwatch.StartNew();
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);
            
            stopwatch.Stop();
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(context.Response.Body).ReadToEndAsync();
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            _logger.LogInformation($"Response: {context.Response.StatusCode} ({stopwatch.ElapsedMilliseconds} ms) Body: {responseText}");
            await responseBody.CopyToAsync(originalBodyStream);
        }
    }
}
