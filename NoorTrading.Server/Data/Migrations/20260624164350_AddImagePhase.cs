using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoorTrading.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImagePhase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phase",
                table: "ProjectImages",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                defaultValue: "Apres");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phase",
                table: "ProjectImages");
        }
    }
}
