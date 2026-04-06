import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntities1775323434913 implements MigrationInterface {
    name = 'CreateEntities1775323434913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_slots" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "label" text NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "max_orders" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_337dcdcca817d4b1dc169173e19" UNIQUE ("code"), CONSTRAINT "PK_f87c73d8648c3f3f297adba3cb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_variants" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "label" text NOT NULL, "unit" text NOT NULL, "price" numeric(12,2) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "service_id" integer, CONSTRAINT "PK_f970f011064ceb277115cc825a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."services_category_enum" AS ENUM('furniture', 'electronics', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."services_pricing_type_enum" AS ENUM('fixed', 'weight_based', 'quote_only')`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "category" "public"."services_category_enum" NOT NULL, "name" text NOT NULL, "description" text, "icon" text, "pricing_type" "public"."services_pricing_type_enum" NOT NULL, "default_unit" text NOT NULL, "base_price" numeric(12,2), "manual_quote_required" boolean NOT NULL DEFAULT false, "requires_image" boolean NOT NULL DEFAULT true, "requires_custom_name" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f019a17cb439406ab185382df9b" UNIQUE ("code"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "service_code_snapshot" character varying(50) NOT NULL, "service_name_snapshot" text NOT NULL, "variant_code_snapshot" character varying(50), "variant_label_snapshot" text, "pricing_type" text NOT NULL, "unit" text NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(12,2), "line_total" numeric(12,2) NOT NULL, "custom_item_name" text, "custom_item_note" text, "manual_quote_required" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_id" integer, "service_id" integer, "service_variant_id" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('cash', 'online')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "payment_code" character varying(40) NOT NULL, "method" "public"."payments_method_enum" NOT NULL, "provider" character varying(100), "provider_ref" character varying(100), "status" "public"."payments_status_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "paid_at" TIMESTAMP WITH TIME ZONE, "failed_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_id" integer, CONSTRAINT "UQ_353a536e71fcc8cbea01ae3926b" UNIQUE ("payment_code"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('cash', 'online')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('unpaid', 'awaiting_payment', 'paid', 'failed')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "order_code" character varying(30) NOT NULL, "status" text NOT NULL DEFAULT 'draft', "payment_method" "public"."orders_payment_method_enum" NOT NULL, "payment_status" "public"."orders_payment_status_enum" NOT NULL, "handling_fee" numeric(12,2) NOT NULL, "service_subtotal" numeric(12,2) NOT NULL, "estimated_total" numeric(12,2) NOT NULL, "final_total" numeric(12,2), "adjustment_reason" text, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customer_id" integer, "time_slot_id" integer, CONSTRAINT "UQ_e462c2f2237b3049aa6be3fce06" UNIQUE ("order_code"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_images" ("id" SERIAL NOT NULL, "file_url" text NOT NULL, "mime_type" character varying(100), "file_size" integer, "image_role" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_id" integer, "uploaded_by_user_id" integer, CONSTRAINT "PK_0dd2c1b7f1e9ed43c41570fac4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "full_name" text NOT NULL, "password" character varying NOT NULL, "phone" character varying(20), "status" text NOT NULL DEFAULT 'active', "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refreshToken" text, "prepaid_required" boolean NOT NULL DEFAULT false, "is_blacklisted" boolean NOT NULL DEFAULT false, "no_show_count" integer NOT NULL DEFAULT '0', "notes" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "otp_code" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('queued', 'sent', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "channel" text NOT NULL, "template_code" character varying(50) NOT NULL, "recipient" text NOT NULL, "status" "public"."notifications_status_enum" NOT NULL, "payload" jsonb NOT NULL, "sent_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, "order_id" integer, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "service_variants" ADD CONSTRAINT "FK_218110e68460a26ae2fb45e754e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_0007194794d1b4ce0ef4883dfa9" FOREIGN KEY ("service_variant_id") REFERENCES "service_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_8941c75f82991baa0d5046ecba3" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_images" ADD CONSTRAINT "FK_aa6de3b6bd302a097df4d221e3e" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_images" ADD CONSTRAINT "FK_9fb701a258c9ddbaafd068be95c" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_5a4f82441ed359b5f135a109804" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_5a4f82441ed359b5f135a109804"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "order_images" DROP CONSTRAINT "FK_9fb701a258c9ddbaafd068be95c"`);
        await queryRunner.query(`ALTER TABLE "order_images" DROP CONSTRAINT "FK_aa6de3b6bd302a097df4d221e3e"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_8941c75f82991baa0d5046ecba3"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_0007194794d1b4ce0ef4883dfa9"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_4b7bcdfcab38cf99bc8ded5c48a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "service_variants" DROP CONSTRAINT "FK_218110e68460a26ae2fb45e754e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "order_images"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TYPE "public"."services_pricing_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."services_category_enum"`);
        await queryRunner.query(`DROP TABLE "service_variants"`);
        await queryRunner.query(`DROP TABLE "time_slots"`);
    }

}
