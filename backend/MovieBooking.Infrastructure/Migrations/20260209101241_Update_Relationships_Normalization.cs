using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieBooking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update_Relationships_Normalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichChieus_PhongChieus_PhongChieuId",
                table: "LichChieus");

            migrationBuilder.DropForeignKey(
                name: "FK_Ves_Ghes_GheId",
                table: "Ves");

            migrationBuilder.DropForeignKey(
                name: "FK_Ves_Ghes_GheId1",
                table: "Ves");

            migrationBuilder.DropIndex(
                name: "IX_Ves_GheId1",
                table: "Ves");

            migrationBuilder.DropColumn(
                name: "GheId1",
                table: "Ves");

            migrationBuilder.AddForeignKey(
                name: "FK_LichChieus_PhongChieus_PhongChieuId",
                table: "LichChieus",
                column: "PhongChieuId",
                principalTable: "PhongChieus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Ves_Ghes_GheId",
                table: "Ves",
                column: "GheId",
                principalTable: "Ghes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LichChieus_PhongChieus_PhongChieuId",
                table: "LichChieus");

            migrationBuilder.DropForeignKey(
                name: "FK_Ves_Ghes_GheId",
                table: "Ves");

            migrationBuilder.AddColumn<int>(
                name: "GheId1",
                table: "Ves",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ves_GheId1",
                table: "Ves",
                column: "GheId1");

            migrationBuilder.AddForeignKey(
                name: "FK_LichChieus_PhongChieus_PhongChieuId",
                table: "LichChieus",
                column: "PhongChieuId",
                principalTable: "PhongChieus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Ves_Ghes_GheId",
                table: "Ves",
                column: "GheId",
                principalTable: "Ghes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Ves_Ghes_GheId1",
                table: "Ves",
                column: "GheId1",
                principalTable: "Ghes",
                principalColumn: "Id");
        }
    }
}
