const { PrismaClient } = require('@prisma/client');

async function seedAtendentes() {
  const prisma = new PrismaClient();
  
  try {
    // Criar alguns atendentes de exemplo
    const atendentes = [
      {
        nome: 'João Silva',
        email: 'joao.silva@koerner.com.br',
        telefone: '(11) 99999-1111',
        cpf: '123.456.789-01',
        rg: '12.345.678-9',
        dataAdmissao: new Date('2023-01-15'),
        dataNascimento: new Date('1990-05-20'),
        cargo: 'Atendente',
        setor: 'Atendimento',
        portaria: 'Portaria A',
        status: 'ATIVO',
        endereco: 'Rua das Flores, 123 - Centro',
        observacoes: 'Atendente dedicado'
      },
      {
        nome: 'Maria Santos',
        email: 'maria.santos@koerner.com.br',
        telefone: '(11) 99999-2222',
        cpf: '987.654.321-02',
        rg: '98.765.432-1',
        dataAdmissao: new Date('2023-03-20'),
        dataNascimento: new Date('1985-08-15'),
        cargo: 'Supervisor',
        setor: 'Supervisão',
        portaria: 'Portaria B',
        status: 'ATIVO',
        endereco: 'Av. Principal, 456 - Jardim',
        observacoes: 'Supervisora experiente'
      },
      {
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@koerner.com.br',
        telefone: '(11) 99999-3333',
        cpf: '456.789.123-03',
        rg: '45.678.912-3',
        dataAdmissao: new Date('2023-06-10'),
        dataNascimento: new Date('1992-12-03'),
        cargo: 'Atendente',
        setor: 'Atendimento',
        portaria: 'Portaria A',
        status: 'ATIVO',
        endereco: 'Rua do Comércio, 789 - Vila Nova',
        observacoes: 'Atendente proativo'
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@koerner.com.br',
        telefone: '(11) 99999-4444',
        cpf: '789.123.456-04',
        rg: '78.912.345-6',
        dataAdmissao: new Date('2023-08-05'),
        dataNascimento: new Date('1988-02-28'),
        cargo: 'Atendente',
        setor: 'Atendimento',
        portaria: 'Portaria C',
        status: 'FERIAS',
        endereco: 'Rua das Acácias, 321 - Bairro Alto',
        observacoes: 'Atendente em férias'
      },
      {
        nome: 'Carlos Ferreira',
        email: 'carlos.ferreira@koerner.com.br',
        telefone: '(11) 99999-5555',
        cpf: '321.654.987-05',
        rg: '32.165.498-7',
        dataAdmissao: new Date('2023-09-12'),
        dataNascimento: new Date('1987-11-10'),
        cargo: 'Coordenador',
        setor: 'Coordenação',
        portaria: 'Portaria B',
        status: 'ATIVO',
        endereco: 'Av. Central, 654 - Centro',
        observacoes: 'Coordenador experiente'
      }
    ];

    console.log('Criando atendentes...');
    
    for (const atendente of atendentes) {
      await prisma.atendente.create({
        data: atendente
      });
      console.log(`Atendente ${atendente.nome} criado com sucesso.`);
    }
    
    console.log('\nTodos os atendentes foram criados com sucesso!');
    
    // Verificar quantos foram criados
    const count = await prisma.atendente.count();
    console.log(`Total de atendentes no banco: ${count}`);
    
  } catch (error) {
    console.error('Erro ao criar atendentes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAtendentes();