using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SourceDev.API.Services
{
    public class ResendEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ResendEmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory; // Factory eklendi

        public ResendEmailService(IConfiguration configuration, ILogger<ResendEmailService> logger, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var traceId = Guid.NewGuid().ToString();

            // Railway Variable veya appsettings'den okur
            var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY") ?? _configuration["Resend:ApiKey"];
            
            // Eğer Resend'de domain onaylamadıysan burası "onboarding@resend.dev" olmalı
            var fromEmail = Environment.GetEnvironmentVariable("MAIL_FROM") ?? _configuration["Email:From"] ?? "onboarding@resend.dev";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError($"[Resend][{traceId}] API Key (RESEND_API_KEY) bulunamadı. Mail gönderilmedi.");
                return;
            }

            var payload = new
            {
                from = "SourceDev <" + fromEmail + ">",
                to = new[] { to }, // Resend array formatını sever
                subject = subject,
                html = body
            };

            var json = JsonSerializer.Serialize(payload);

            // Best Practice: Client'ı factory'den üretiyoruz
            var client = _httpClientFactory.CreateClient();
            
            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            try
            {
                _logger.LogInformation($"[Resend][{traceId}] {to} adresine mail gönderiliyor...");

                var response = await client.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation($"[Resend][{traceId}] Mail başarıyla gönderildi. ID: {responseBody}");
                }
                else
                {
                    _logger.LogError($"[Resend][{traceId}] HATA: {response.StatusCode}, Detay: {responseBody}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[Resend][{traceId}] Mail gönderilirken exception oluştu.");
            }
        }
    }
}