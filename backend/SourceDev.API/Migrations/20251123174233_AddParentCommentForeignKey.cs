using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class AddParentCommentForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Comments_parent_comment_id",
                table: "Comments",
                column: "parent_comment_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Comments_parent_comment_id",
                table: "Comments",
                column: "parent_comment_id",
                principalTable: "Comments",
                principalColumn: "comment_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Comments_parent_comment_id",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_parent_comment_id",
                table: "Comments");
        }
    }
}
