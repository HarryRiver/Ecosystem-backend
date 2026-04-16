import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariantIcon1776099656642 implements MigrationInterface {
    name = 'AddVariantIcon1776099656642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_variants" ADD "icon" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_variants" DROP COLUMN "icon"`);
    }

}
