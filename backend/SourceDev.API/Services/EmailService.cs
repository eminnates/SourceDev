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
            try
            {
                var email = new MimeMessage();
                // Initial placeholder, will be updated below
                email.From.Add(new MailboxAddress("SourceDev", "no-reply@sourcedev.com"));
                email.To.Add(new MailboxAddress("", to));
                email.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = body };
                email.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                // Accept all SSL certificates (for development only)
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                // Try to get settings from Environment variables first, then Configuration
                var host = Environment.GetEnvironmentVariable("MAIL_HOST") ?? _configuration["Email:Host"];
                var portStr = Environment.GetEnvironmentVariable("MAIL_PORT") ?? _configuration["Email:Port"];
                var port = int.TryParse(portStr, out var p) ? p : 587;
                var username = Environment.GetEnvironmentVariable("MAIL_USERNAME") ?? _configuration["Email:Username"];
                var password = Environment.GetEnvironmentVariable("MAIL_PASSWORD") ?? _configuration["Email:Password"];
                var fromEmail = Environment.GetEnvironmentVariable("MAIL_FROM") ?? _configuration["Email:From"] ?? "no-reply@sourcedev.com";
                // Update From address if we have a configured one
                if (email.From.Count > 0)
                {
                    email.From.Clear();
                    email.From.Add(new MailboxAddress("SourceDev", fromEmail));
                }

                if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || username == "your-email@gmail.com")
                {
                    _logger.LogWarning("Email settings are missing or default. Skipping email send.");
                    _logger.LogInformation("================ EMAIL MOCK ================");
                    _logger.LogInformation($"To: {to}");
                    _logger.LogInformation($"Subject: {subject}");
                    _logger.LogInformation($"Body: {body}");
                    _logger.LogInformation("============================================");
                    return;
                }

                await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(username, password);
                
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation($"Email sent successfully to {to}");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Failed to send email");
                // Don't throw exception to prevent breaking the registration flow
                // But in production you might want to handle this differently
            }
        }
    }
}
