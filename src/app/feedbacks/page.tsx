'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function FeedbacksPage() {
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setCarregando(false);
    }, 1000);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Feedbacks</h1>
              <p className="text-muted-foreground">
                Gerencie e visualize todos os feedbacks da equipe
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Feedback
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +23% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                51% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Construtivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30</div>
              <p className="text-xs text-muted-foreground">
                34% do total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sugestões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">
                15% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar feedbacks..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Feedbacks */}
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes</CardTitle>
            <CardDescription>
              Lista dos feedbacks mais recentes da equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Carregando feedbacks...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Exemplo de feedback positivo */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-green-700">JS</span>
                      </div>
                      <div>
                        <h3 className="font-medium">João Silva</h3>
                        <p className="text-xs text-muted-foreground">há 2 horas</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Positivo
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excelente atendimento ao cliente hoje. Demonstrou grande empatia e resolveu o problema de forma eficiente.
                  </p>
                </div>

                {/* Exemplo de feedback construtivo */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-yellow-700">MS</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Maria Santos</h3>
                        <p className="text-xs text-muted-foreground">há 1 dia</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      Construtivo
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seria interessante melhorar a comunicação durante os atendimentos. Talvez explicar melhor os procedimentos para os clientes.
                  </p>
                </div>

                {/* Exemplo de sugestão */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">PS</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Pedro Santos</h3>
                        <p className="text-xs text-muted-foreground">há 3 dias</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Sugestão
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Que tal implementarmos um sistema de follow-up automático para garantir a satisfação do cliente após o atendimento?
                  </p>
                </div>
                
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Esta página está em desenvolvimento. Em breve você poderá gerenciar todos os feedbacks aqui.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}