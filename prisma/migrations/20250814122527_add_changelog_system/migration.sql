-- CreateEnum
CREATE TYPE "public"."tipo_usuario" AS ENUM ('ADMIN', 'SUPERVISOR', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "public"."tipo_feedback" AS ENUM ('ELOGIO', 'SUGESTAO', 'RECLAMACAO', 'MELHORIA');

-- CreateEnum
CREATE TYPE "public"."prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "public"."status_feedback" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "public"."tipo_mudanca" AS ENUM ('ADICIONADO', 'ALTERADO', 'CORRIGIDO', 'REMOVIDO', 'DEPRECIADO', 'SEGURANCA');

-- CreateEnum
CREATE TYPE "public"."categoria_changelog" AS ENUM ('FUNCIONALIDADE', 'INTERFACE', 'PERFORMANCE', 'SEGURANCA', 'CONFIGURACAO', 'DOCUMENTACAO', 'TECNICO');

-- CreateEnum
CREATE TYPE "public"."prioridade_changelog" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipoUsuario" "public"."tipo_usuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "supervisorId" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."avaliacoes" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "periodo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedbacks" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "public"."tipo_feedback" NOT NULL,
    "prioridade" "public"."prioridade" NOT NULL DEFAULT 'MEDIA',
    "status" "public"."status_feedback" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "receptorId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "nomeTabela" TEXT,
    "registroId" TEXT,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "enderecoIp" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."changelog" (
    "id" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "dataLancamento" TIMESTAMP(3) NOT NULL,
    "tipo" "public"."tipo_mudanca" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "public"."categoria_changelog",
    "prioridade" "public"."prioridade_changelog" NOT NULL DEFAULT 'MEDIA',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "autorId" TEXT,

    CONSTRAINT "changelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."changelog_itens" (
    "id" TEXT NOT NULL,
    "changelogId" TEXT NOT NULL,
    "tipo" "public"."tipo_mudanca" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelog_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_avaliadoId_avaliadorId_periodo_key" ON "public"."avaliacoes"("avaliadoId", "avaliadorId", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "changelog_versao_key" ON "public"."changelog"("versao");

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "feedbacks_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "feedbacks_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."changelog" ADD CONSTRAINT "changelog_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."changelog_itens" ADD CONSTRAINT "changelog_itens_changelogId_fkey" FOREIGN KEY ("changelogId") REFERENCES "public"."changelog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
