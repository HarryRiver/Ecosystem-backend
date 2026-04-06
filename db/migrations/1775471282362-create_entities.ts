import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntities1775471282362 implements MigrationInterface {
    name = 'CreateEntities1775471282362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vouchers_type_enum" AS ENUM('percent', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "vouchers" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "type" "public"."vouchers_type_enum" NOT NULL DEFAULT 'fixed', "value" numeric(12,2) NOT NULL, "max_discount" numeric(12,2), "min_order_value" numeric(12,2) NOT NULL DEFAULT '0', "usage_limit" integer NOT NULL DEFAULT '0', "used_count" integer NOT NULL DEFAULT '0', "per_user_limit" integer NOT NULL DEFAULT '1', "start_date" TIMESTAMP WITH TIME ZONE, "end_date" TIMESTAMP WITH TIME ZONE, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_efc30b2b9169e05e0e1e19d6dd6" UNIQUE ("code"), CONSTRAINT "PK_ed1b7dd909a696560763acdbc04" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "customer_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "customer_phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "customer_email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "pickup_address" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "booking_date" date`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "manual_quote_required" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "cash_policy_accepted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "voucher_id" integer`);
        await queryRunner.query(`ALTER TABLE "service_variants" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE TYPE "public"."service_variants_unit_enum" AS ENUM('item', 'bag', 'kg')`);
        await queryRunner.query(`ALTER TABLE "service_variants" ADD "unit" "public"."service_variants_unit_enum" NOT NULL DEFAULT 'item'`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "default_unit"`);
        await queryRunner.query(`CREATE TYPE "public"."services_default_unit_enum" AS ENUM('item', 'bag', 'kg')`);
        await queryRunner.query(`ALTER TABLE "services" ADD "default_unit" "public"."services_default_unit_enum" NOT NULL DEFAULT 'item'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_3478da368b5a2f4b7690f44f711" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_3478da368b5a2f4b7690f44f711"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "default_unit"`);
        await queryRunner.query(`DROP TYPE "public"."services_default_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "default_unit" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_variants" DROP COLUMN "unit"`);
        await queryRunner.query(`DROP TYPE "public"."service_variants_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "service_variants" ADD "unit" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "voucher_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cash_policy_accepted"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "manual_quote_required"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_phone"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_name"`);
        await queryRunner.query(`DROP TABLE "vouchers"`);
        await queryRunner.query(`DROP TYPE "public"."vouchers_type_enum"`);
    }

}
