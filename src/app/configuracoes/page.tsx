'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, RefreshCw, Database, Shield, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConfiguracoesPage() {
  const [carregando, setCarregando] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações gerais
    nomeEmpresa: 'Koerner 360',
    emailContato: 'contato@koerner360.com',
    
    // Configurações de notificações
    notificacoesEmail: true,
    notificacoesPush: false,
    
    // Configurações de sistema
    backupAutomatico: true,
    logAuditoria: true,
    sessaoTimeout: 30,
    

  });

  const handleSalvar = async () => {
    setCarregando(true);
    // Simular salvamento
    setTimeout(() => {
      setCarregando(false);
      // Aqui você implementaria a lógica de salvamento real
    }, 2000);
  };

  const handleConfigChange = (key: string, value: string | number | boolean) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">
                Gerencie as configurações do sistema
              </p>
            </div>
          </div>
          <Button onClick={handleSalvar} disabled={carregando}>
            {carregando ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Apenas administradores podem alterar as configurações do sistema.
          </AlertDescription>
        </Alert>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas da empresa e sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  value={configuracoes.nomeEmpresa}
                  onChange={(e) => handleConfigChange('nomeEmpresa', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailContato">Email de Contato</Label>
                <Input
                  id="emailContato"
                  type="email"
                  value={configuracoes.emailContato}
                  onChange={(e) => handleConfigChange('emailContato', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como e quando receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações importantes por email
                </p>
              </div>
              <Switch
                checked={configuracoes.notificacoesEmail}
                onCheckedChange={(checked) => handleConfigChange('notificacoesEmail', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações push no navegador
                </p>
              </div>
              <Switch
                checked={configuracoes.notificacoesPush}
                onCheckedChange={(checked) => handleConfigChange('notificacoesPush', checked)}
              />
            </div>

          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações avançadas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Realizar backup automático dos dados
                </p>
              </div>
              <Switch
                checked={configuracoes.backupAutomatico}
                onCheckedChange={(checked) => handleConfigChange('backupAutomatico', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log de Auditoria</Label>
                <p className="text-sm text-muted-foreground">
                  Manter registro de todas as ações do sistema
                </p>
              </div>
              <Switch
                checked={configuracoes.logAuditoria}
                onCheckedChange={(checked) => handleConfigChange('logAuditoria', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="sessaoTimeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="sessaoTimeout"
                type="number"
                min="5"
                max="120"
                value={configuracoes.sessaoTimeout}
                onChange={(e) => handleConfigChange('sessaoTimeout', parseInt(e.target.value))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                Tempo limite para sessões inativas
              </p>
            </div>
          </CardContent>
        </Card>



        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento. Em breve você poderá configurar todos os aspectos do sistema aqui.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}