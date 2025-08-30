import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756580418039 implements MigrationInterface {
    name = 'Init1756580418039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("userId" uuid NOT NULL, "defaultRadius" integer, "dietaryPreferences" text, "cuisinePreferences" text, "defaultLocationAddress" character varying NOT NULL, "defaultLocationLatitude" double precision NOT NULL, "defaultLocationLongitude" double precision NOT NULL, CONSTRAINT "PK_b6202d1cacc63a0b9c8dac2abd4" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
