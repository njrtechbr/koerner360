import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    console.log('🔐 Testando processo de login...');
    
    const testEmail = 'admin@koerner.com';
    const testPassword = 'admin123';
    
    console.log(`📧 Testando login com: ${testEmail}`);
    
    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email: testEmail }
    });
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`👤 Usuário encontrado: ${usuario.nome} (${usuario.tipoUsuario})`);
    console.log(`🔑 Hash da senha no banco: ${usuario.senha.substring(0, 20)}...`);
    
    // Testar comparação de senha
    const senhaValida = await bcrypt.compare(testPassword, usuario.senha);
    
    if (senhaValida) {
      console.log('✅ Senha válida! Login deveria funcionar.');
      console.log('📋 Dados que seriam retornados:');
      console.log(`   - ID: ${usuario.id}`);
      console.log(`   - Email: ${usuario.email}`);
      console.log(`   - Nome: ${usuario.nome}`);
      console.log(`   - Tipo: ${usuario.tipoUsuario}`);
      console.log(`   - Ativo: ${usuario.ativo}`);
    } else {
      console.log('❌ Senha inválida!');
      
      // Testar se a senha foi hasheada corretamente
      const novoHash = await bcrypt.hash(testPassword, 12);
      console.log(`🔍 Novo hash para comparação: ${novoHash.substring(0, 20)}...`);
      
      // Verificar se o hash atual é válido
      const hashValido = usuario.senha.startsWith('$2');
      console.log(`🔍 Hash no banco é válido (bcrypt): ${hashValido}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();