import { PrismaClient } from '@prisma/client';
import { StatusAtendente } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para criar mais atendentes variados para testes
 * Inclui diferentes setores, cargos e status
 */
async function criarMaisAtendentesParaTeste() {
  try {
    console.log('🚀 Iniciando criação de mais atendentes para teste...');

    // Lista de atendentes variados para criar
    const atendentesVariados = [
      {
        nome: 'Beatriz Oliveira Santos',
        email: 'beatriz.santos@koerner360.com',
        telefone: '(11) 98765-5001',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-04-15'),
        dataNascimento: new Date('1992-06-10'),
        rg: '40.123.456-7',
        cpf: '401.234.567-89',
        setor: 'Recursos Humanos',
        cargo: 'Analista de RH',
        endereco: 'Rua Augusta, 1500 - Consolação',
        observacoes: 'Especialista em recrutamento e seleção',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Diego Ferreira Costa',
        email: 'diego.costa@koerner360.com',
        telefone: '(11) 98765-5002',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-05-20'),
        dataNascimento: new Date('1989-09-25'),
        rg: '41.234.567-8',
        cpf: '412.345.678-90',
        setor: 'Tecnologia',
        cargo: 'Suporte Técnico',
        endereco: 'Av. Faria Lima, 2000 - Itaim Bibi',
        observacoes: 'Responsável pelo suporte de TI',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Gabriela Lima Rodrigues',
        email: 'gabriela.rodrigues@koerner360.com',
        telefone: '(11) 98765-5003',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-06-10'),
        dataNascimento: new Date('1995-12-03'),
        rg: '42.345.678-9',
        cpf: '423.456.789-01',
        setor: 'Marketing',
        cargo: 'Coordenadora de Marketing',
        endereco: 'Rua Oscar Freire, 800 - Jardins',
        observacoes: 'Especialista em marketing digital',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Henrique Silva Almeida',
        email: 'henrique.almeida@koerner360.com',
        telefone: '(11) 98765-5004',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-07-01'),
        dataNascimento: new Date('1987-04-18'),
        rg: '43.456.789-0',
        cpf: '434.567.890-12',
        setor: 'Financeiro',
        cargo: 'Analista Financeiro',
        endereco: 'Rua Vergueiro, 1200 - Vila Mariana',
        observacoes: 'Responsável pela análise financeira',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Isabella Martins Pereira',
        email: 'isabella.pereira@koerner360.com',
        telefone: '(11) 98765-5005',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-08-15'),
        dataNascimento: new Date('1993-01-22'),
        rg: '44.567.890-1',
        cpf: '445.678.901-23',
        setor: 'Qualidade',
        cargo: 'Supervisora de Qualidade',
        endereco: 'Av. Paulista, 1000 - Bela Vista',
        observacoes: 'Responsável pelo controle de qualidade',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'João Pedro Nascimento',
        email: 'joao.nascimento@koerner360.com',
        telefone: '(11) 98765-5006',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-09-01'),
        dataNascimento: new Date('1991-08-14'),
        rg: '45.678.901-2',
        cpf: '456.789.012-34',
        setor: 'Operações',
        cargo: 'Coordenador de Operações',
        endereco: 'Rua da Consolação, 500 - Centro',
        observacoes: 'Coordena as operações diárias',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Larissa Santos Oliveira',
        email: 'larissa.oliveira@koerner360.com',
        telefone: '(11) 98765-5007',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-10-10'),
        dataNascimento: new Date('1994-05-30'),
        rg: '46.789.012-3',
        cpf: '467.890.123-45',
        setor: 'Vendas',
        cargo: 'Consultora de Vendas',
        endereco: 'Rua Bela Cintra, 300 - Consolação',
        observacoes: 'Especialista em vendas corporativas',
        status: StatusAtendente.FERIAS
      },
      {
        nome: 'Matheus Costa Silva',
        email: 'matheus.silva@koerner360.com',
        telefone: '(11) 98765-5008',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-11-05'),
        dataNascimento: new Date('1990-11-12'),
        rg: '47.890.123-4',
        cpf: '478.901.234-56',
        setor: 'Logística',
        cargo: 'Analista de Logística',
        endereco: 'Av. Rebouças, 1800 - Pinheiros',
        observacoes: 'Responsável pela logística interna',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Natália Rodrigues Lima',
        email: 'natalia.lima@koerner360.com',
        telefone: '(11) 98765-5009',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-12-01'),
        dataNascimento: new Date('1988-02-28'),
        rg: '48.901.234-5',
        cpf: '489.012.345-67',
        setor: 'Jurídico',
        cargo: 'Assistente Jurídica',
        endereco: 'Rua Estados Unidos, 600 - Jardins',
        observacoes: 'Suporte jurídico e contratos',
        status: StatusAtendente.AFASTADO
      },
      {
        nome: 'Rafael Almeida Santos',
        email: 'rafael.santos@koerner360.com',
        telefone: '(11) 98765-5010',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2024-01-15'),
        dataNascimento: new Date('1986-07-05'),
        rg: '49.012.345-6',
        cpf: '490.123.456-78',
        setor: 'Comunicação',
        cargo: 'Analista de Comunicação',
        endereco: 'Rua Haddock Lobo, 900 - Cerqueira César',
        observacoes: 'Responsável pela comunicação interna',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Sophia Pereira Costa',
        email: 'sophia.costa@koerner360.com',
        telefone: '(11) 98765-5011',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2024-02-01'),
        dataNascimento: new Date('1996-10-15'),
        rg: '50.123.456-7',
        cpf: '501.234.567-89',
        setor: 'Treinamento',
        cargo: 'Instrutora de Treinamento',
        endereco: 'Av. Brigadeiro Faria Lima, 1500 - Jardim Paulistano',
        observacoes: 'Especialista em desenvolvimento de pessoas',
        status: StatusAtendente.ATIVO
      },
      {
        nome: 'Thiago Oliveira Ferreira',
        email: 'thiago.ferreira@koerner360.com',
        telefone: '(11) 98765-5012',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2024-03-10'),
        dataNascimento: new Date('1985-12-20'),
        rg: '51.234.567-8',
        cpf: '512.345.678-90',
        setor: 'Compras',
        cargo: 'Comprador',
        endereco: 'Rua Pamplona, 400 - Jardim Paulista',
        observacoes: 'Responsável pelas compras corporativas',
        status: StatusAtendente.INATIVO
      }
    ];

    console.log(`📝 Criando ${atendentesVariados.length} atendentes variados...`);

    // Criar atendentes um por um para identificar possíveis erros
    let criadosComSucesso = 0;
    
    for (const atendente of atendentesVariados) {
      try {
        const novoAtendente = await prisma.atendente.create({
          data: atendente
        });
        console.log(`✅ Atendente criado: ${novoAtendente.nome} - ${novoAtendente.setor}/${novoAtendente.cargo}`);
        criadosComSucesso++;
      } catch (error) {
        console.error(`❌ Erro ao criar atendente ${atendente.nome}:`, error);
      }
    }

    console.log(`\n✅ ${criadosComSucesso} atendentes variados criados com sucesso!`);

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
      const statusIcon = atendente.status === 'ATIVO' ? '🟢' : 
                        atendente.status === 'FERIAS' ? '🟡' :
                        atendente.status === 'AFASTADO' ? '🟠' : '🔴';
      console.log(`${index + 1}. ${statusIcon} ${atendente.nome} - ${atendente.setor}/${atendente.cargo} ${tipoAtendente}`);
    });

    // Estatísticas por setor
    const estatisticasSetor = todosAtendentes.reduce((acc, atendente) => {
      acc[atendente.setor] = (acc[atendente.setor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Estatísticas por setor:');
    Object.entries(estatisticasSetor)
      .sort(([,a], [,b]) => b - a)
      .forEach(([setor, quantidade]) => {
        console.log(`   ${setor}: ${quantidade} atendente(s)`);
      });

    // Estatísticas por status
    const estatisticasStatus = todosAtendentes.reduce((acc, atendente) => {
      acc[atendente.status] = (acc[atendente.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📈 Estatísticas por status:');
    Object.entries(estatisticasStatus).forEach(([status, quantidade]) => {
      const statusIcon = status === 'ATIVO' ? '🟢' : 
                        status === 'FERIAS' ? '🟡' :
                        status === 'AFASTADO' ? '🟠' : '🔴';
      console.log(`   ${statusIcon} ${status}: ${quantidade} atendente(s)`);
    });

    console.log(`\n📊 Total de atendentes no sistema: ${todosAtendentes.length}`);
    const atendentesComUsuario = todosAtendentes.filter(a => a.usuarioId).length;
    const atendentesSemUsuario = todosAtendentes.filter(a => !a.usuarioId).length;
    console.log(`   - Com usuário: ${atendentesComUsuario}`);
    console.log(`   - Sem usuário: ${atendentesSemUsuario}`);

  } catch (error) {
    console.error('❌ Erro ao criar atendentes variados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
criarMaisAtendentesParaTeste()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução do script:', error);
    process.exit(1);
  });