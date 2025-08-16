import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para criar 10 atendentes que não são usuários do sistema
 * Apenas registros na tabela de atendentes para representar funcionários
 */
async function criarAtendentesApenas() {
  try {
    console.log('🚀 Iniciando criação de atendentes...');

    // Lista de atendentes para criar
    const atendentes = [
      {
        nome: 'Roberto Silva Santos',
        email: 'roberto.santos@empresa.com',
        telefone: '(11) 98765-4321',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-01-15'),
        dataNascimento: new Date('1985-03-20'),
        rg: '12.345.678-9',
        cpf: '123.456.789-01',
        setor: 'Recepção',
        cargo: 'Recepcionista',
        endereco: 'Rua das Palmeiras, 100 - Vila Madalena',
        observacoes: 'Recepcionista experiente'
      },
      {
        nome: 'Fernanda Costa Lima',
        email: 'fernanda.lima@empresa.com',
        telefone: '(11) 98765-4322',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-02-10'),
        dataNascimento: new Date('1990-07-15'),
        rg: '23.456.789-0',
        cpf: '234.567.890-12',
        setor: 'Atendimento',
        cargo: 'Atendente',
        endereco: 'Av. Rebouças, 200 - Pinheiros',
        observacoes: 'Atendente dedicada'
      },
      {
        nome: 'Paulo Henrique Oliveira',
        email: 'paulo.oliveira@empresa.com',
        telefone: '(11) 98765-4323',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-03-05'),
        dataNascimento: new Date('1988-11-30'),
        rg: '34.567.890-1',
        cpf: '345.678.901-23',
        setor: 'Segurança',
        cargo: 'Segurança',
        endereco: 'Rua Haddock Lobo, 300 - Cerqueira César',
        observacoes: 'Profissional de segurança'
      },
      {
        nome: 'Juliana Pereira Souza',
        email: 'juliana.souza@empresa.com',
        telefone: '(11) 98765-4324',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-04-12'),
        dataNascimento: new Date('1992-05-08'),
        rg: '45.678.901-2',
        cpf: '456.789.012-34',
        setor: 'Limpeza',
        cargo: 'Auxiliar de Limpeza',
        endereco: 'Rua da Consolação, 400 - Consolação',
        observacoes: 'Auxiliar de limpeza dedicada'
      },
      {
        nome: 'Ricardo Almeida Ferreira',
        email: 'ricardo.ferreira@empresa.com',
        telefone: '(11) 98765-4325',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-05-20'),
        dataNascimento: new Date('1987-09-12'),
        rg: '56.789.012-3',
        cpf: '567.890.123-45',
        setor: 'Manutenção',
        cargo: 'Técnico de Manutenção',
        endereco: 'Av. Paulista, 500 - Bela Vista',
        observacoes: 'Técnico especializado'
      },
      {
        nome: 'Camila Rodrigues Martins',
        email: 'camila.martins@empresa.com',
        telefone: '(11) 98765-4326',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-06-08'),
        dataNascimento: new Date('1991-12-25'),
        rg: '67.890.123-4',
        cpf: '678.901.234-56',
        setor: 'Recepção',
        cargo: 'Recepcionista',
        endereco: 'Rua Augusta, 600 - Consolação',
        observacoes: 'Recepcionista atenciosa'
      },
      {
        nome: 'Anderson Barbosa Silva',
        email: 'anderson.silva@empresa.com',
        telefone: '(11) 98765-4327',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-07-15'),
        dataNascimento: new Date('1989-04-18'),
        rg: '78.901.234-5',
        cpf: '789.012.345-67',
        setor: 'Portaria',
        cargo: 'Porteiro',
        endereco: 'Rua Oscar Freire, 700 - Jardins',
        observacoes: 'Porteiro responsável'
      },
      {
        nome: 'Patrícia Gomes Nascimento',
        email: 'patricia.nascimento@empresa.com',
        telefone: '(11) 98765-4328',
        portaria: 'Portaria B',
        dataAdmissao: new Date('2023-08-22'),
        dataNascimento: new Date('1993-01-10'),
        rg: '89.012.345-6',
        cpf: '890.123.456-78',
        setor: 'Atendimento',
        cargo: 'Atendente',
        endereco: 'Av. Faria Lima, 800 - Itaim Bibi',
        observacoes: 'Atendente experiente'
      },
      {
        nome: 'Marcos Vinícius Santos',
        email: 'marcos.santos@empresa.com',
        telefone: '(11) 98765-4329',
        portaria: 'Portaria C',
        dataAdmissao: new Date('2023-09-10'),
        dataNascimento: new Date('1986-08-05'),
        rg: '90.123.456-7',
        cpf: '901.234.567-89',
        setor: 'Segurança',
        cargo: 'Supervisor de Segurança',
        endereco: 'Rua Bela Cintra, 900 - Consolação',
        observacoes: 'Supervisor de segurança experiente'
      },
      {
        nome: 'Luciana Alves Pereira',
        email: 'luciana.pereira@empresa.com',
        telefone: '(11) 98765-4330',
        portaria: 'Portaria A',
        dataAdmissao: new Date('2023-10-05'),
        dataNascimento: new Date('1994-06-22'),
        rg: '01.234.567-8',
        cpf: '012.345.678-90',
        setor: 'Limpeza',
        cargo: 'Coordenadora de Limpeza',
        endereco: 'Rua Estados Unidos, 1000 - Jardins',
        observacoes: 'Coordenadora de limpeza experiente'
      }
    ];

    console.log(`📝 Criando ${atendentes.length} atendentes...`);

    // Criar atendentes em lote
    const atendentesCreated = await prisma.atendente.createMany({
      data: atendentes,
      skipDuplicates: true
    });

    console.log(`✅ ${atendentesCreated.count} atendentes criados com sucesso!`);

    // Listar todos os atendentes criados
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

    console.log('\n📋 Lista de todos os atendentes:');
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
    console.error('❌ Erro ao criar atendentes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
criarAtendentesApenas()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução do script:', error);
    process.exit(1);
  });