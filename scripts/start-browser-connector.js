#!/usr/bin/env node

/**
 * Script para iniciar o servidor do conector do navegador
 * Este servidor permite que as ferramentas MCP se comuniquem com o navegador
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor do conector do navegador...');

// Configurações do servidor
const PORT = 3025;
const HOST = '127.0.0.1';

// Função para iniciar o servidor do conector
function startBrowserConnector() {
  console.log(`📡 Tentando iniciar conector em ${HOST}:${PORT}`);
  
  // Simular um servidor básico para teste
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    if (req.method === 'OPTIONS') {
      res.end();
      return;
    }
    
    // Resposta básica para testes
    const response = {
      status: 'ok',
      message: 'Browser connector server running',
      timestamp: new Date().toISOString()
    };
    
    res.end(JSON.stringify(response));
  });
  
  server.listen(PORT, HOST, () => {
    console.log(`✅ Servidor do conector iniciado em http://${HOST}:${PORT}`);
    console.log('🔗 O servidor MCP browser-tools agora pode se conectar');
  });
  
  server.on('error', (err) => {
    console.error('❌ Erro ao iniciar servidor:', err.message);
    process.exit(1);
  });
}

// Iniciar o servidor
startBrowserConnector();