using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPostSlugIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Posts_slug",
                table: "Posts",
                column: "slug");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_slug_status",
                table: "Posts",
                columns: new[] { "slug", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Posts_slug",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_slug_status",
                table: "Posts");
        }
    }
}
