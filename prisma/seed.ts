import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.feedback.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.usuario.deleteMany();

  // Hash das senhas
  const senhaHashAdmin = await bcrypt.hash('admin123', 12);
  const senhaHashSupervisor = await bcrypt.hash('supervisor123', 12);
  const senhaHashAtendente = await bcrypt.hash('atendente123', 12);

  // Criar usuários
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@koerner360.com',
      nome: 'Administrador',
      senha: senhaHashAdmin,
      tipoUsuario: 'ADMIN',
    },
  });

  const supervisor = await prisma.usuario.create({
    data: {
      email: 'supervisor@koerner360.com',
      nome: 'João Supervisor',
      senha: senhaHashSupervisor,
      tipoUsuario: 'SUPERVISOR',
    },
  });

  const atendente = await prisma.usuario.create({
    data: {
      email: 'atendente@koerner360.com',
      nome: 'Maria Atendente',
      senha: senhaHashAtendente,
      tipoUsuario: 'ATENDENTE',
      supervisorId: supervisor.id,
    },
  });

  // Criar avaliações de exemplo
  await prisma.avaliacao.create({
    data: {
      nota: 4,
      comentario: 'Excelente atendimento ao cliente, sempre prestativo.',
      periodo: '2024-12',
      avaliadoId: atendente.id,
      avaliadorId: supervisor.id,
    },
  });

  await prisma.avaliacao.create({
    data: {
      nota: 5,
      comentario: 'Liderança exemplar e gestão eficiente da equipe.',
      periodo: '2024-12',
      avaliadoId: supervisor.id,
      avaliadorId: admin.id,
    },
  });

  // Criar feedbacks de exemplo
  await prisma.feedback.create({
    data: {
      titulo: 'Melhoria no sistema de atendimento',
      conteudo: 'Sugiro implementar um sistema de tickets para melhor organização.',
      tipo: 'SUGESTAO',
      prioridade: 'MEDIA',
      receptorId: supervisor.id,
      remetenteId: atendente.id,
    },
  });

  await prisma.feedback.create({
    data: {
      titulo: 'Excelente trabalho em equipe',
      conteudo: 'A equipe demonstrou grande colaboração no último projeto.',
      tipo: 'ELOGIO',
      prioridade: 'BAIXA',
      status: 'RESOLVIDO',
      receptorId: atendente.id,
      remetenteId: supervisor.id,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👤 Usuários criados: ${admin.nome}, ${supervisor.nome}, ${atendente.nome}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });