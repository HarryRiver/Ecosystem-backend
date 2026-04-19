import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotificationTable1776601168898 implements MigrationInterface {
    name = 'UpdateNotificationTable1776601168898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "is_read" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "read_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "template_code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "recipient" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "status" SET DEFAULT 'queued'`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "payload" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "payload" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "recipient" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "template_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "read_at"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "is_read"`);
    }

}
