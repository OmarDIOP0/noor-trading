using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoorTrading.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTimelineAndServiceDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Domain",
                table: "Services",
                type: "TEXT",
                maxLength: 20,
                nullable: false,
                defaultValue: "GenieCivil");

            migrationBuilder.CreateTable(
                name: "TimelineEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Organization = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Location = table.Column<string>(type: "TEXT", maxLength: 160, nullable: true),
                    Period = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    StartYear = table.Column<int>(type: "INTEGER", nullable: true),
                    IsCurrent = table.Column<bool>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimelineEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimelineEntries_DisplayOrder",
                table: "TimelineEntries",
                column: "DisplayOrder");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimelineEntries");

            migrationBuilder.DropColumn(
                name: "Domain",
                table: "Services");
        }
    }
}
