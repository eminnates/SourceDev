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
            var allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173" };
            var origin = context.Request.Headers["Origin"].ToString();

            if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
                context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
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
