using System.Security.Claims;

namespace SourceDev.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int? GetUserId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? user.FindFirstValue("sub");

            return int.TryParse(claim, out var userId) ? userId : null;
        }
    }
}
