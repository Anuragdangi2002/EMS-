/*
  Warnings:

  - Added the required column `phone` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "phone" VARCHAR(20) NOT NULL;
