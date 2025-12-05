namespace SourceDev.API.DTOs.Auth
{
    public class LoginDto
    {
        public string EmailOrUsername { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; } = false;
    }
}
