'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestSessionPage() {
  const { data: session, status, update } = useSession();
  const [logs, setLogs] = useState<string[]>([]);
  const [isTestingFetch, setIsTestingFetch] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog(`Status da sessão: ${status}`);
    if (session) {
      addLog(`Usuário logado: ${session.user?.name || 'N/A'}`);
    }
  }, [session, status]);

  const testDirectFetch = async () => {
    setIsTestingFetch(true);
    addLog('Iniciando teste de fetch direto para /api/auth/session');
    
    try {
      const response = await fetch('/api/auth/session');
      addLog(`Status da resposta: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Dados recebidos: ${JSON.stringify(data)}`);
      } else {
        addLog(`Erro na resposta: ${response.statusText}`);
      }
    } catch (error) {
      addLog(`Erro no fetch: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTestingFetch(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'authenticated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unauthenticated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teste de Sessão NextAuth</h1>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            Status: {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            
            {status === 'authenticated' && session && (
              <div className="space-y-2">
                <div>
                  <strong>Nome:</strong> {session.user?.name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {session.user?.email || 'N/A'}
                </div>
                <div>
                  <strong>Tipo:</strong> {(session.user as any)?.userType || 'N/A'}
                </div>
                <div>
                  <strong>ID:</strong> {session.user?.id || 'N/A'}
                </div>
              </div>
            )}

            {status === 'unauthenticated' && (
              <Alert>
                <AlertDescription>
                  Usuário não autenticado. Faça login para ver as informações da sessão.
                </AlertDescription>
              </Alert>
            )}

            {status === 'loading' && (
              <Alert>
                <AlertDescription>
                  Carregando informações da sessão...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testes de API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testDirectFetch} 
                disabled={isTestingFetch}
                variant="outline"
              >
                {isTestingFetch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Testar Fetch Direto
              </Button>
              
              <Button 
                onClick={() => update()} 
                variant="outline"
              >
                Atualizar Sessão
              </Button>
            </div>

            <Button 
              onClick={clearLogs} 
              variant="destructive" 
              size="sm"
            >
              Limpar Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum log ainda...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}