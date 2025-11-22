using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class RemovePostReactionIdAddReactionsCollection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "comments_count",
                table: "Posts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "title",
                table: "Posts",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "comments_count",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "title",
                table: "Posts");
        }
    }
}
