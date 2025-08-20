import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUsers() {
  console.log('🚀 Criando usuários de demonstração...');

  try {
    // Verificar se já existem usuários de demo
    const existingAdmin = await prisma.usuario.findFirst({
      where: { email: 'admin@koerner.com' }
    });

    if (existingAdmin) {
      console.log('ℹ️ Usuários de demonstração já existem');
      return;
    }

    // Hash das senhas
    const adminPassword = await bcrypt.hash('admin123', 12);
    const supervisorPassword = await bcrypt.hash('super123', 12);
    const attendantPassword = await bcrypt.hash('atend123', 12);

    // Criar usuários de demonstração
    const demoUsers = [
      {
        nome: 'Administrador Sistema',
        email: 'admin@koerner.com',
        senha: adminPassword,
        userType: 'ADMIN' as const,
        ativo: true,
      },
      {
        nome: 'Supervisor Geral',
        email: 'supervisor@koerner.com',
        senha: supervisorPassword,
        userType: 'SUPERVISOR' as const,
        ativo: true,
      },
      {
        nome: 'Atendente Demonstração',
        email: 'atendente@koerner.com',
        senha: attendantPassword,
        userType: 'ATENDENTE' as const,
        ativo: true,
      },
    ];

    // Inserir usuários
    for (const user of demoUsers) {
      await prisma.usuario.create({
        data: user,
      });
      console.log(`✅ Usuário criado: ${user.nome} (${user.email})`);
    }

    console.log('\n🎉 Usuários de demonstração criados com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('👑 Admin: admin@koerner.com / admin123');
    console.log('👥 Supervisor: supervisor@koerner.com / super123');
    console.log('👤 Atendente: atendente@koerner.com / atend123');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de demonstração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createDemoUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createDemoUsers };