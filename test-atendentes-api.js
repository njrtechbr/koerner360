const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAtendentesAPI() {
  try {
    console.log('🔍 Testando API de Atendentes...');
    
    // 1. Verificar se há atendentes no banco
    const atendentesCount = await prisma.atendente.count();
    console.log(`📊 Total de atendentes no banco: ${atendentesCount}`);
    
    // 2. Buscar atendentes com os mesmos filtros da API
    const atendentes = await prisma.atendente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        status: true,
        setor: true,
        cargo: true,
        portaria: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true,
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
      take: 10
    });
    
    console.log(`📋 Atendentes encontrados: ${atendentes.length}`);
    
    if (atendentes.length > 0) {
      console.log('\n📄 Primeiro atendente:');
      console.log(JSON.stringify(atendentes[0], null, 2));
      
      // 3. Simular formatação da API
      const atendenteFormatado = {
        ...atendentes[0],
        cpf: atendentes[0].cpf ? atendentes[0].cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : null,
        telefone: atendentes[0].telefone ? atendentes[0].telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : null
      };
      
      console.log('\n🎨 Atendente formatado:');
      console.log(JSON.stringify(atendenteFormatado, null, 2));
    }
    
    // 4. Verificar usuários para autenticação
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, email: true, tipoUsuario: true }
    });
    
    console.log(`\n👥 Usuários ativos: ${usuarios.length}`);
    if (usuarios.length > 0) {
      console.log('Primeiro usuário:', usuarios[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAtendentesAPI();