import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSvName1776098927343 implements MigrationInterface {
    name = 'UpdateSvName1776098927343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "service_variant_name" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "service_variant_name"`);
    }

}
