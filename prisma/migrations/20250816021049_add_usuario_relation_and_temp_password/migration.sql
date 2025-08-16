/*
  Warnings:

  - A unique constraint covering the columns `[atendenteId,avaliadorId,periodo]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."status_atendente" AS ENUM ('ATIVO', 'FERIAS', 'AFASTADO', 'INATIVO');

-- DropForeignKey
ALTER TABLE "public"."avaliacoes" DROP CONSTRAINT "avaliacoes_avaliadoId_fkey";

-- AlterTable
ALTER TABLE "public"."audit_logs" ADD COLUMN     "atendenteId" TEXT;

-- AlterTable
ALTER TABLE "public"."avaliacoes" ADD COLUMN     "atendenteId" TEXT,
ALTER COLUMN "avaliadoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "senhaTemporaria" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."atendentes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."status_atendente" NOT NULL DEFAULT 'ATIVO',
    "avatarUrl" TEXT,
    "foto" BYTEA,
    "telefone" TEXT NOT NULL,
    "portaria" TEXT NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "rg" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_email_key" ON "public"."atendentes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_rg_key" ON "public"."atendentes"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_cpf_key" ON "public"."atendentes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_usuarioId_key" ON "public"."atendentes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_atendenteId_avaliadorId_periodo_key" ON "public"."avaliacoes"("atendenteId", "avaliadorId", "periodo");

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "public"."atendentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "public"."atendentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendentes" ADD CONSTRAINT "atendentes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
