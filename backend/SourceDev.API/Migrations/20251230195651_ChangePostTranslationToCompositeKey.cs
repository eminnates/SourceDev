using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangePostTranslationToCompositeKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PostTranslations",
                table: "PostTranslations");

            migrationBuilder.DropIndex(
                name: "IX_PostTranslations_post_id_language_code",
                table: "PostTranslations");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "PostTranslations",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostTranslations",
                table: "PostTranslations",
                columns: new[] { "post_id", "language_code" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PostTranslations",
                table: "PostTranslations");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "PostTranslations",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostTranslations",
                table: "PostTranslations",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_PostTranslations_post_id_language_code",
                table: "PostTranslations",
                columns: new[] { "post_id", "language_code" },
                unique: true);
        }
    }
}
