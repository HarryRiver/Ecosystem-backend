import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSizeToVariants1775931127565 implements MigrationInterface {
    name = 'AddSizeToVariants1775931127565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_variants" ADD "size" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_variants" DROP COLUMN "size"`);
    }

}
