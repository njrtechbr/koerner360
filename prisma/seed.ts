import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.feedback.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.atendente.deleteMany();
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

  const atendente1 = await prisma.usuario.create({
    data: {
      email: 'maria.silva@koerner360.com',
      nome: 'Maria Silva',
      senha: senhaHashAtendente,
      tipoUsuario: 'ATENDENTE',
      supervisorId: supervisor.id,
    },
  });

  const atendente2 = await prisma.usuario.create({
    data: {
      email: 'carlos.santos@koerner360.com',
      nome: 'Carlos Santos',
      senha: senhaHashAtendente,
      tipoUsuario: 'ATENDENTE',
      supervisorId: supervisor.id,
    },
  });

  const atendente3 = await prisma.usuario.create({
    data: {
      email: 'ana.costa@koerner360.com',
      nome: 'Ana Costa',
      senha: senhaHashAtendente,
      tipoUsuario: 'ATENDENTE',
      supervisorId: supervisor.id,
    },
  });

  // Criar registros de atendentes
  const atendenteRecord1 = await prisma.atendente.create({
    data: {
      nome: 'Maria Silva',
      email: 'maria.silva@koerner360.com',
      telefone: '(11) 99999-1111',
      portaria: 'Portaria A',
      dataAdmissao: new Date('2023-01-15'),
      dataNascimento: new Date('1990-05-20'),
      rg: '12.345.678-9',
      cpf: '123.456.789-01',
      setor: 'Atendimento',
      cargo: 'Atendente Pleno',
      endereco: 'Rua das Flores, 123 - Centro',
      observacoes: 'Atendente experiente com foco em qualidade',
      usuarioId: atendente1.id,
    },
  });

  const atendenteRecord2 = await prisma.atendente.create({
    data: {
      nome: 'Carlos Santos',
      email: 'carlos.santos@koerner360.com',
      telefone: '(11) 99999-2222',
      portaria: 'Portaria B',
      dataAdmissao: new Date('2023-03-10'),
      dataNascimento: new Date('1988-11-15'),
      rg: '23.456.789-0',
      cpf: '234.567.890-12',
      setor: 'Atendimento',
      cargo: 'Atendente Sênior',
      endereco: 'Av. Paulista, 456 - Bela Vista',
      observacoes: 'Especialista em atendimento corporativo',
      usuarioId: atendente2.id,
    },
  });

  const atendenteRecord3 = await prisma.atendente.create({
    data: {
      nome: 'Ana Costa',
      email: 'ana.costa@koerner360.com',
      telefone: '(11) 99999-3333',
      portaria: 'Portaria C',
      dataAdmissao: new Date('2023-06-01'),
      dataNascimento: new Date('1992-08-30'),
      rg: '34.567.890-1',
      cpf: '345.678.901-23',
      setor: 'Atendimento',
      cargo: 'Atendente Júnior',
      endereco: 'Rua Augusta, 789 - Consolação',
      observacoes: 'Em desenvolvimento profissional',
      usuarioId: atendente3.id,
    },
  });

  // Criar avaliações de exemplo
  await prisma.avaliacao.create({
    data: {
      nota: 4,
      comentario: 'Excelente atendimento ao cliente, sempre prestativo.',
      periodo: '2024-12',
      avaliadoId: atendente1.id,
      avaliadorId: supervisor.id,
    },
  });

  await prisma.avaliacao.create({
    data: {
      nota: 5,
      comentario: 'Demonstra grande conhecimento técnico e agilidade.',
      periodo: '2024-12',
      avaliadoId: atendente2.id,
      avaliadorId: supervisor.id,
    },
  });

  await prisma.avaliacao.create({
    data: {
      nota: 3,
      comentario: 'Boa evolução, mas ainda precisa melhorar a comunicação.',
      periodo: '2024-12',
      avaliadoId: atendente3.id,
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
      remetenteId: atendente1.id,
    },
  });

  await prisma.feedback.create({
    data: {
      titulo: 'Excelente trabalho em equipe',
      conteudo: 'A equipe demonstrou grande colaboração no último projeto.',
      tipo: 'ELOGIO',
      prioridade: 'BAIXA',
      status: 'RESOLVIDO',
      receptorId: atendente2.id,
      remetenteId: supervisor.id,
    },
  });

  await prisma.feedback.create({
    data: {
      titulo: 'Dificuldade com novo sistema',
      conteudo: 'Estou tendo dificuldades para usar o novo sistema de gestão.',
      tipo: 'RECLAMACAO',
      prioridade: 'ALTA',
      receptorId: admin.id,
      remetenteId: atendente3.id,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👤 Usuários criados: ${admin.nome}, ${supervisor.nome}`);
  console.log(`👥 Atendentes criados: ${atendente1.nome}, ${atendente2.nome}, ${atendente3.nome}`);
  console.log(`📊 Registros de atendentes: ${atendenteRecord1.nome}, ${atendenteRecord2.nome}, ${atendenteRecord3.nome}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });