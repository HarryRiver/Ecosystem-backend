import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServiceCategories1775879760834 implements MigrationInterface {
    name = 'UpdateServiceCategories1775879760834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."services_category_enum" RENAME TO "services_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."services_category_enum" AS ENUM('furniture', 'electronics', 'metals', 'plastics', 'paper', 'clothes', 'vehicles', 'other')`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "category" TYPE "public"."services_category_enum" USING "category"::"text"::"public"."services_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."services_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."services_category_enum_old" AS ENUM('furniture', 'electronics', 'other')`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "category" TYPE "public"."services_category_enum_old" USING "category"::"text"::"public"."services_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."services_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."services_category_enum_old" RENAME TO "services_category_enum"`);
    }

}
