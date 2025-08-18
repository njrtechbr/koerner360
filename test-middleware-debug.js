// Script para testar o middleware e entender o redirecionamento
const { execSync } = require('child_process');

console.log('🔍 Testando comportamento do middleware...');

// Teste 1: Verificar se há sessão ativa
console.log('\n1. Testando endpoint de debug da sessão:');
try {
  const result = execSync('curl -s http://localhost:3000/api/debug/session', { encoding: 'utf8' });
  console.log('Resposta:', result);
} catch (error) {
  console.error('Erro:', error.message);
}

// Teste 2: Verificar comportamento do middleware
console.log('\n2. Testando endpoint de debug do middleware:');
try {
  const result = execSync('curl -s http://localhost:3000/api/debug/middleware', { encoding: 'utf8' });
  console.log('Resposta:', result);
} catch (error) {
  console.error('Erro:', error.message);
}

// Teste 3: Testar acesso direto à página /usuarios
console.log('\n3. Testando acesso direto a /usuarios:');
try {
  const result = execSync('curl -s -I http://localhost:3000/usuarios', { encoding: 'utf8' });
  console.log('Headers da resposta:');
  console.log(result);
} catch (error) {
  console.error('Erro:', error.message);
}

// Teste 4: Verificar se há cookies de sessão
console.log('\n4. Testando com cookies (se houver):');
try {
  const result = execSync('curl -s -c cookies.txt -b cookies.txt http://localhost:3000/api/debug/session', { encoding: 'utf8' });
  console.log('Resposta com cookies:', result);
} catch (error) {
  console.error('Erro:', error.message);
}

console.log('\n✅ Testes concluídos!');
console.log('\n💡 Análise:');
console.log('- Se não há sessão ativa, o redirecionamento para /login está correto');
console.log('- Se há sessão mas userType não é ADMIN, o redirecionamento para /dashboard está correto');
console.log('- O problema pode estar na detecção da sessão ou nas permissões do middleware');