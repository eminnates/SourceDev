using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPostTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Posts_slug",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_slug_status",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "content_markdown",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "slug",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "title",
                table: "Posts");

            migrationBuilder.AddColumn<string>(
                name: "default_language_code",
                table: "Posts",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PostTranslations",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    language_code = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    content_markdown = table.Column<string>(type: "character varying(30000)", maxLength: 30000, nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostTranslations", x => x.id);
                    table.ForeignKey(
                        name: "FK_PostTranslations_Posts_post_id",
                        column: x => x.post_id,
                        principalTable: "Posts",
                        principalColumn: "post_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostTranslations_post_id_language_code",
                table: "PostTranslations",
                columns: new[] { "post_id", "language_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostTranslations_slug_language_code",
                table: "PostTranslations",
                columns: new[] { "slug", "language_code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PostTranslations");

            migrationBuilder.DropColumn(
                name: "default_language_code",
                table: "Posts");

            migrationBuilder.AddColumn<string>(
                name: "content_markdown",
                table: "Posts",
                type: "character varying(30000)",
                maxLength: 30000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "slug",
                table: "Posts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "title",
                table: "Posts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_slug",
                table: "Posts",
                column: "slug");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_slug_status",
                table: "Posts",
                columns: new[] { "slug", "status" });
        }
    }
}
