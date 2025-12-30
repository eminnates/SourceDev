using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace SourceDev.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var traceId = Guid.NewGuid().ToString();
            _logger.LogInformation($"[Mail][{traceId}] Preparing to send email. To: {to}, Subject: {subject}");
            try
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("SourceDev", "no-reply@sourcedev.com"));
                email.To.Add(new MailboxAddress("", to));
                email.Subject = subject;
                var bodyBuilder = new BodyBuilder { HtmlBody = body };
                email.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                var host = Environment.GetEnvironmentVariable("MAIL_HOST") ?? _configuration["Email:Host"];
                var portStr = Environment.GetEnvironmentVariable("MAIL_PORT") ?? _configuration["Email:Port"];
                var port = int.TryParse(portStr, out var p) ? p : 587;
                var username = Environment.GetEnvironmentVariable("MAIL_USERNAME") ?? _configuration["Email:Username"];
                var password = Environment.GetEnvironmentVariable("MAIL_PASSWORD") ?? _configuration["Email:Password"];
                var fromEmail = Environment.GetEnvironmentVariable("MAIL_FROM") ?? _configuration["Email:From"] ?? "no-reply@sourcedev.com";
                if (email.From.Count > 0)
                {
                    email.From.Clear();
                    email.From.Add(new MailboxAddress("SourceDev", fromEmail));
                }

                _logger.LogInformation($"[Mail][{traceId}] SMTP Config: Host={host}, Port={port}, Username={username}, From={fromEmail}");

                if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || username == "your-email@gmail.com")
                {
                    _logger.LogWarning($"[Mail][{traceId}] Email settings are missing or default. Skipping email send.");
                    _logger.LogInformation($"[Mail][{traceId}] ================ EMAIL MOCK ================");
                    _logger.LogInformation($"[Mail][{traceId}] To: {to}");
                    _logger.LogInformation($"[Mail][{traceId}] Subject: {subject}");
                    _logger.LogInformation($"[Mail][{traceId}] Body: {body}");
                    _logger.LogInformation($"[Mail][{traceId}] ============================================");
                    return;
                }

                try
                {
                    _logger.LogInformation($"[Mail][{traceId}] Connecting to SMTP server...");
                    await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                    _logger.LogInformation($"[Mail][{traceId}] Connected to SMTP server.");
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, $"[Mail][{traceId}] SMTP connection failed.");
                    throw;
                }

                try
                {
                    _logger.LogInformation($"[Mail][{traceId}] Authenticating SMTP user...");
                    await client.AuthenticateAsync(username, password);
                    _logger.LogInformation($"[Mail][{traceId}] SMTP authentication successful.");
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, $"[Mail][{traceId}] SMTP authentication failed.");
                    throw;
                }

                try
                {
                    _logger.LogInformation($"[Mail][{traceId}] Sending email...");
                    await client.SendAsync(email);
                    _logger.LogInformation($"[Mail][{traceId}] Email sent successfully to {to}");
                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, $"[Mail][{traceId}] Email send failed.");
                    throw;
                }

                try
                {
                    await client.DisconnectAsync(true);
                    _logger.LogInformation($"[Mail][{traceId}] SMTP disconnected.");
                }
                catch (System.Exception ex)
                {
                    _logger.LogWarning(ex, $"[Mail][{traceId}] SMTP disconnect failed.");
                }
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"[Mail][{traceId}] Failed to send email (outer catch)");
                // Don't throw exception to prevent breaking the registration flow
            }
        }
    }
}
