import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747618204891 implements MigrationInterface {
    name = 'Init1747618204891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_preferences" ("userId" uuid NOT NULL, "defaultRadius" integer, "dietaryPreferences" text, "cuisinePreferences" text, "defaultLocationAddress" character varying NOT NULL, "defaultLocationLatitude" double precision NOT NULL, "defaultLocationLongitude" double precision NOT NULL, CONSTRAINT "PK_b6202d1cacc63a0b9c8dac2abd4" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
    }

}
