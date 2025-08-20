import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarCriarUsuarioAPI() {
  try {
    console.log('🔍 Testando API de criação de usuário para atendente...');
    
    // Buscar um atendente sem usuário
    const atendenteSemUsuario = await prisma.atendente.findFirst({
      where: {
        usuarioId: null,
        status: 'ATIVO',
        email: {
          not: '',
          contains: '@'
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
        usuarioId: true
      }
    });

    if (!atendenteSemUsuario) {
      console.log('❌ Nenhum atendente sem usuário encontrado para teste');
      return;
    }

    console.log('✅ Atendente encontrado para teste:', {
      id: atendenteSemUsuario.id,
      nome: atendenteSemUsuario.nome,
      email: atendenteSemUsuario.email,
      status: atendenteSemUsuario.status
    });

    // Simular chamada da API
    const response = await fetch(`http://localhost:3001/api/atendentes/${atendenteSemUsuario.id}/criar-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Simular uma sessão válida (em produção seria obtida do cookie)
        'Cookie': 'authjs.session-token=test-session'
      },
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📦 Dados da resposta:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ API funcionando corretamente!');
      console.log('🔑 Credenciais retornadas:', data.data?.credenciais);
      
      // Verificar se o usuário foi criado no banco
      const usuarioCriado = await prisma.usuario.findUnique({
        where: { email: atendenteSemUsuario.email! },
        select: {
          id: true,
          nome: true,
          email: true,
          userType: true,
          ativo: true,
          senhaTemporaria: true
        }
      });
      
      console.log('👤 Usuário criado no banco:', usuarioCriado);
      
      // Verificar se o atendente foi atualizado
      const atendenteAtualizado = await prisma.atendente.findUnique({
        where: { id: atendenteSemUsuario.id },
        select: {
          id: true,
          nome: true,
          usuarioId: true
        }
      });
      
      console.log('👨‍💼 Atendente atualizado:', atendenteAtualizado);
    } else {
      console.log('❌ Erro na API:', data.error || 'Erro desconhecido');
    }

  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testarCriarUsuarioAPI().catch(console.error);