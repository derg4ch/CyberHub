using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CyberHub.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "cyberhub_db");

            migrationBuilder.CreateTable(
                name: "packages",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    category = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    xp_reward = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_packages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tournaments",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    game = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    prize_pool = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    entry_fee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    max_participants = table.Column<int>(type: "integer", nullable: false),
                    current_participants = table.Column<int>(type: "integer", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tournaments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "text", nullable: true),
                    full_name = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    avatar_url = table.Column<string>(type: "text", nullable: true),
                    role = table.Column<string>(type: "text", nullable: false, defaultValue: "user"),
                    xp_points = table.Column<int>(type: "integer", nullable: false),
                    level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    total_sessions = table.Column<int>(type: "integer", nullable: false),
                    total_hours = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "zones",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    tier = table.Column<string>(type: "text", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    seat_count = table.Column<int>(type: "integer", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_zones", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "workstations",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    zone_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    position_x = table.Column<int>(type: "integer", nullable: false),
                    position_y = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workstations", x => x.id);
                    table.ForeignKey(
                        name: "fk_workstations_zones_zone_id",
                        column: x => x.zone_id,
                        principalSchema: "cyberhub_db",
                        principalTable: "zones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                schema: "cyberhub_db",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workstation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    zone_id = table.Column<Guid>(type: "uuid", nullable: false),
                    package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    xp_earned = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                    table.ForeignKey(
                        name: "fk_bookings_packages_package_id",
                        column: x => x.package_id,
                        principalSchema: "cyberhub_db",
                        principalTable: "packages",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_bookings_workstations_workstation_id",
                        column: x => x.workstation_id,
                        principalSchema: "cyberhub_db",
                        principalTable: "workstations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_bookings_zones_zone_id",
                        column: x => x.zone_id,
                        principalSchema: "cyberhub_db",
                        principalTable: "zones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_package_id",
                schema: "cyberhub_db",
                table: "bookings",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_status",
                schema: "cyberhub_db",
                table: "bookings",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_user_id",
                schema: "cyberhub_db",
                table: "bookings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_workstation_id_start_time",
                schema: "cyberhub_db",
                table: "bookings",
                columns: new[] { "workstation_id", "start_time" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_zone_id",
                schema: "cyberhub_db",
                table: "bookings",
                column: "zone_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                schema: "cyberhub_db",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_workstations_zone_id",
                schema: "cyberhub_db",
                table: "workstations",
                column: "zone_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bookings",
                schema: "cyberhub_db");

            migrationBuilder.DropTable(
                name: "tournaments",
                schema: "cyberhub_db");

            migrationBuilder.DropTable(
                name: "users",
                schema: "cyberhub_db");

            migrationBuilder.DropTable(
                name: "packages",
                schema: "cyberhub_db");

            migrationBuilder.DropTable(
                name: "workstations",
                schema: "cyberhub_db");

            migrationBuilder.DropTable(
                name: "zones",
                schema: "cyberhub_db");
        }
    }
}
