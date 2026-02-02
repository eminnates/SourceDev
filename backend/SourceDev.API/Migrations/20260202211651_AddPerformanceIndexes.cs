using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reactions_post_id",
                table: "Reactions");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_user_id",
                table: "Posts",
                newName: "IX_Posts_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Comments_post_id",
                table: "Comments",
                newName: "IX_Comments_PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "Tags",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_PostId_UserId",
                table: "Reactions",
                columns: new[] { "post_id", "user_id" });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_CreatedAt",
                table: "Posts",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_PublishedAt",
                table: "Posts",
                column: "published_at");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_Status_PublishedAt",
                table: "Posts",
                columns: new[] { "status", "published_at" });

            migrationBuilder.CreateIndex(
                name: "IX_Posts_ViewCount",
                table: "Posts",
                column: "view_count");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_UserId_CreatedAt",
                table: "Bookmarks",
                columns: new[] { "user_id", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tags_Name",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Reactions_PostId_UserId",
                table: "Reactions");

            migrationBuilder.DropIndex(
                name: "IX_Posts_CreatedAt",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_PublishedAt",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_Status_PublishedAt",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_ViewCount",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_UserId_CreatedAt",
                table: "Bookmarks");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_UserId",
                table: "Posts",
                newName: "IX_Posts_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_Comments_PostId",
                table: "Comments",
                newName: "IX_Comments_post_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reactions_post_id",
                table: "Reactions",
                column: "post_id");
        }
    }
}
