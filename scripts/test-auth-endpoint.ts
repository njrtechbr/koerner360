// Usando fetch nativo do Node.js 18+

async function testAuthEndpoint() {
  try {
    console.log('🔍 Testando endpoint de autenticação...');
    
    const baseUrl = 'http://localhost:3001';
    
    // Teste 1: Verificar se o endpoint de sessão responde
    console.log('\n📡 Testando GET /api/auth/session...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${sessionResponse.status}`);
    console.log(`Headers:`, Object.fromEntries(sessionResponse.headers.entries()));
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.text();
      console.log(`Resposta: ${sessionData || 'null'}`);
    } else {
      console.log(`Erro: ${sessionResponse.statusText}`);
    }
    
    // Teste 2: Verificar se o endpoint de providers responde
    console.log('\n📡 Testando GET /api/auth/providers...');
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${providersResponse.status}`);
    if (providersResponse.ok) {
      const providersData = await providersResponse.text();
      console.log(`Resposta: ${providersData}`);
    } else {
      console.log(`Erro: ${providersResponse.statusText}`);
    }
    
    // Teste 3: Verificar se o endpoint de signin responde
    console.log('\n📡 Testando GET /api/auth/signin...');
    const signinResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${signinResponse.status}`);
    if (signinResponse.ok) {
      const signinData = await signinResponse.text();
      console.log(`Resposta (primeiros 200 chars): ${signinData.substring(0, 200)}...`);
    } else {
      console.log(`Erro: ${signinResponse.statusText}`);
    }
    
    console.log('\n✅ Teste de endpoints de autenticação concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoints de autenticação:', error);
  }
}

testAuthEndpoint();