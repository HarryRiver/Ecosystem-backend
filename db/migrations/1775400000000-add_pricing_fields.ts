import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPricingFields1775400000000 implements MigrationInterface {
  name = 'AddPricingFields1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "handling_mode" text NOT NULL DEFAULT 'inside'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "stairs_floors" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "measurement_value" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "measurement_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "stairs_floors"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "handling_mode"`,
    );
  }
}
