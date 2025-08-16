/*
  Warnings:

  - Added the required column `endereco` to the `atendentes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Adiciona as colunas com valor padrão temporário
ALTER TABLE "public"."atendentes" ADD COLUMN "endereco" TEXT NOT NULL DEFAULT 'Não informado';
ALTER TABLE "public"."atendentes" ADD COLUMN "observacoes" TEXT;

-- Remove o valor padrão da coluna endereco
ALTER TABLE "public"."atendentes" ALTER COLUMN "endereco" DROP DEFAULT;
