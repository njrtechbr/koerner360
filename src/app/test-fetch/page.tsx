'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de teste para verificar problemas com fetch
 */
export default function TestFetchPage() {
  const [resultado, setResultado] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const testarFetch = async () => {
    setCarregando(true);
    setResultado('');
    
    try {
      console.log('Iniciando teste de fetch...');
      
      const response = await fetch('/api/atendentes?limite=1');
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      setResultado(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro no teste de fetch:', error);
      setResultado(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setCarregando(false);
    }
  };

  const testarSession = async () => {
    setCarregando(true);
    setResultado('');
    
    try {
      console.log('Testando sessão...');
      
      const response = await fetch('/api/auth/session');
      
      console.log('Session response status:', response.status);
      console.log('Session response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Session data:', data);
      
      setResultado(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro no teste de sessão:', error);
      setResultado(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Fetch - Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testarFetch} 
              disabled={carregando}
            >
              {carregando ? 'Testando...' : 'Testar API Atendentes'}
            </Button>
            
            <Button 
              onClick={testarSession} 
              disabled={carregando}
              variant="outline"
            >
              {carregando ? 'Testando...' : 'Testar Sessão'}
            </Button>
          </div>
          
          {resultado && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {resultado}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}