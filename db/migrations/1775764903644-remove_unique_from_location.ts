import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueFromLocation1775764903644 implements MigrationInterface {
    name = 'RemoveUniqueFromLocation1775764903644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_c972549fe46c0a5790435d72e6d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_d7121c9aff32a1a3eb95e8fbcaa"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_d7121c9aff32a1a3eb95e8fbcaa" UNIQUE ("district")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_c972549fe46c0a5790435d72e6d" UNIQUE ("city")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c" UNIQUE ("address")`);
    }

}
