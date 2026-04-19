import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertNotificationIdToNumber1776601602867 implements MigrationInterface {
    name = 'RevertNotificationIdToNumber1776601602867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")`);
    }

}
