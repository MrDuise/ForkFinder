import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747618391361 implements MigrationInterface {
    name = 'Init1747618391361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "defaultLocation"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "defaultLocation" character varying`);
    }

}
