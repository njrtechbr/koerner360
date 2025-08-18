#!/usr/bin/env node

/**
 * Servidor do conector do navegador para MCP browser-tools
 * Simula um navegador com logs de console para testes
 */

const http = require('http');
const url = require('url');

const PORT = 3025;
const HOST = '127.0.0.1';

// Dados simulados para testes
const mockConsoleData = {
  logs: [
    {
      level: 'info',
      message: 'Aplicação Koerner 360 iniciada',
      timestamp: new Date().toISOString(),
      source: 'console'
    },
    {
      level: 'log',
      message: 'Next.js App Router carregado',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      source: 'console'
    },
    {
      level: 'warn',
      message: 'Aviso: Componente renderizado sem key prop',
      timestamp: new Date(Date.now() - 10000).toISOString(),
      source: 'console'
    },
    {
      level: 'error',
      message: 'Erro de validação no formulário de usuário',
      timestamp: new Date(Date.now() - 15000).toISOString(),
      source: 'console'
    }
  ],
  errors: [
    {
      message: 'TypeError: Cannot read property of undefined',
      stack: 'at UserForm.tsx:45:12',
      timestamp: new Date(Date.now() - 20000).toISOString()
    }
  ],
  networkLogs: [
    {
      url: '/api/usuarios',
      method: 'GET',
      status: 200,
      timestamp: new Date(Date.now() - 2000).toISOString()
    },
    {
      url: '/api/auth/session',
      method: 'GET',
      status: 200,
      timestamp: new Date(Date.now() - 3000).toISOString()
    }
  ]
};

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`📥 ${req.method} ${pathname}`);
  
  // Rotas do conector
  switch (pathname) {
    case '/':
    case '/health':
    case '/api/health':
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'connected',
        service: 'browser-connector',
        version: '1.0.0',
        capabilities: ['console', 'network', 'screenshot'],
        timestamp: new Date().toISOString()
      }));
      break;
      
    case '/console/logs':
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockConsoleData.logs
      }));
      break;
      
    case '/console/errors':
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockConsoleData.errors
      }));
      break;
      
    case '/network/logs':
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockConsoleData.networkLogs
      }));
      break;
      
    case '/screenshot':
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: {
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          timestamp: new Date().toISOString()
        }
      }));
      break;
      
    default:
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'Endpoint não encontrado',
        path: pathname
      }));
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`🌐 Servidor do conector do navegador iniciado`);
  console.log(`📡 Endereço: http://${HOST}:${PORT}`);
  console.log(`🔗 Pronto para receber conexões do MCP browser-tools`);
  console.log(`\n📋 Endpoints disponíveis:`);
  console.log(`   GET  /health          - Status do servidor`);
  console.log(`   GET  /console/logs    - Logs do console`);
  console.log(`   GET  /console/errors  - Erros do console`);
  console.log(`   GET  /network/logs    - Logs de rede`);
  console.log(`   GET  /screenshot      - Screenshot da página`);
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Porta ${PORT} já está em uso. Tentando próxima porta...`);
    server.listen(PORT + 1, HOST);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor do conector...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
});

console.log('🚀 Iniciando servidor do conector do navegador...');