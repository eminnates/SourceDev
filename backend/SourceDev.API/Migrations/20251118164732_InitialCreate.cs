using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SourceDev.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "Posts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserFollows_following_id",
                table: "UserFollows",
                column: "following_id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserFollows_Users_follower_id",
                table: "UserFollows",
                column: "follower_id",
                principalTable: "Users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserFollows_Users_following_id",
                table: "UserFollows",
                column: "following_id",
                principalTable: "Users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserFollows_Users_follower_id",
                table: "UserFollows");

            migrationBuilder.DropForeignKey(
                name: "FK_UserFollows_Users_following_id",
                table: "UserFollows");

            migrationBuilder.DropIndex(
                name: "IX_UserFollows_following_id",
                table: "UserFollows");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "Posts");
        }
    }
}
