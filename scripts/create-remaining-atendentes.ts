import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para criar os 3 atendentes restantes que não foram criados
 * devido a possíveis conflitos de dados únicos
 */
async function criarAtendentesRestantes() {
  try {
    console.log('🚀 Iniciando criação dos atendentes restantes...');

    // Lista dos 3 atendentes que não foram criados
    const atendentesRestantes = [
      {
        nome: 'Roberto Silva Santos',
        email: 'roberto.silva.santos@empresa.com', // Email alterado
        telefone: '(11) 98765-4331',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-01-15'),
        dataNascimento: new Date('1985-03-20'),
        rg: '11.345.678-9', // RG alterado
        cpf: '111.456.789-01', // CPF alterado
        setor: 'Recepção',
        cargo: 'Recepcionista',
        endereco: 'Rua das Palmeiras, 100 - Vila Madalena',
        observacoes: 'Recepcionista com experiência em atendimento'
      },
      {
        nome: 'Fernanda Costa Lima',
        email: 'fernanda.costa.lima@empresa.com', // Email alterado
        telefone: '(11) 98765-4332',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-02-10'),
        dataNascimento: new Date('1990-07-15'),
        rg: '22.456.789-0', // RG alterado
        cpf: '222.567.890-12', // CPF alterado
        setor: 'Atendimento',
        cargo: 'Atendente',
        endereco: 'Av. Rebouças, 200 - Pinheiros',
        observacoes: 'Atendente dedicada e pontual'
      },
      {
        nome: 'Paulo Henrique Oliveira',
        email: 'paulo.henrique.oliveira@empresa.com', // Email alterado
        telefone: '(11) 98765-4333',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-03-05'),
        dataNascimento: new Date('1988-11-30'),
        rg: '33.567.890-1', // RG alterado
        cpf: '333.678.901-23', // CPF alterado
        setor: 'Segurança',
        cargo: 'Segurança',
        endereco: 'Rua Haddock Lobo, 300 - Cerqueira César',
        observacoes: 'Profissional de segurança experiente'
      }
    ];

    console.log(`📝 Criando ${atendentesRestantes.length} atendentes restantes...`);

    // Criar atendentes um por um para identificar possíveis erros
    let criadosComSucesso = 0;
    
    for (const atendente of atendentesRestantes) {
      try {
        const novoAtendente = await prisma.atendente.create({
          data: atendente
        });
        console.log(`✅ Atendente criado: ${novoAtendente.nome}`);
        criadosComSucesso++;
      } catch (error) {
        console.error(`❌ Erro ao criar atendente ${atendente.nome}:`, error);
      }
    }

    console.log(`\n✅ ${criadosComSucesso} atendentes restantes criados com sucesso!`);

    // Listar todos os atendentes atuais
    const todosAtendentes = await prisma.atendente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        setor: true,
        cargo: true,
        status: true,
        usuarioId: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    console.log('\n📋 Lista atualizada de todos os atendentes:');
    todosAtendentes.forEach((atendente, index) => {
      const tipoAtendente = atendente.usuarioId ? '(Usuário)' : '(Apenas Atendente)';
      console.log(`${index + 1}. ${atendente.nome} - ${atendente.setor}/${atendente.cargo} ${tipoAtendente}`);
    });

    console.log(`\n📊 Total de atendentes no sistema: ${todosAtendentes.length}`);
    const atendentesComUsuario = todosAtendentes.filter(a => a.usuarioId).length;
    const atendentesSemUsuario = todosAtendentes.filter(a => !a.usuarioId).length;
    console.log(`   - Com usuário: ${atendentesComUsuario}`);
    console.log(`   - Sem usuário: ${atendentesSemUsuario}`);

  } catch (error) {
    console.error('❌ Erro ao criar atendentes restantes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
criarAtendentesRestantes()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução do script:', error);
    process.exit(1);
  });