using System.Linq;
namespace SourceDev.API.Middlewares
{
    public class DynamicCorsMiddleware
    {
        private readonly RequestDelegate _next;

        public DynamicCorsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // #region agent log
            try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "DynamicCorsMiddleware.cs:13", message = "CORS middleware entry", data = new { origin = context.Request.Headers["Origin"].ToString(), method = context.Request.Method }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
            // #endregion
            // Get allowed origins from environment variable or use defaults
            var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
            var allowedOrigins = !string.IsNullOrEmpty(allowedOriginsEnv)
                ? allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                : new[] { 
                    "http://localhost:3000", 
                    "http://localhost:5173",
                    "https://source-dev.vercel.app",
                    "https://soucedev.tr",
                    "https://www.soucedev.tr"
                };
            
            var origin = context.Request.Headers["Origin"].ToString();

            // Check if origin matches any allowed origin or is a Vercel domain
            bool isAllowed = false;
            if (!string.IsNullOrEmpty(origin))
            {
                // Exact match
                isAllowed = allowedOrigins.Contains(origin);
                
                // Also allow any Vercel preview deployment
                if (!isAllowed && origin.EndsWith(".vercel.app"))
                {
                    isAllowed = true;
                }
            }

            if (isAllowed)
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS,PATCH";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "DynamicCorsMiddleware.cs:47", message = "CORS headers set", data = new { origin = origin }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
            }
            else
            {
                // #region agent log
                try { var logData = System.Text.Json.JsonSerializer.Serialize(new { sessionId = "debug-session", runId = "run1", hypothesisId = "B", location = "DynamicCorsMiddleware.cs:51", message = "CORS headers NOT set", data = new { origin = origin, isAllowed = false }, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }); await System.IO.File.AppendAllTextAsync("/home/emin/Documents/projects/SourceDev/.cursor/debug.log", logData + "\n"); } catch { }
                // #endregion
            }

            // Preflight (OPTIONS) isteği ise hemen yanıtla
            if (context.Request.Method == "OPTIONS")
            {
                context.Response.StatusCode = 204;
                return;
            }

            await _next(context);

        }

    }
}
