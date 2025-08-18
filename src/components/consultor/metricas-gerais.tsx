'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Tipos para os dados da API (snake_case e com números como string)
interface RawMetricasGerais {
  total_avaliacoes: number;
  media_geral: string | number;
  total_atendentes: number;
  distribuicao_notas: Array<{ nota: number; quantidade: number; }>;
  tendencia_mensal: Array<{ mes: string; media: string | number; }>;
  performance_por_cargo: Array<{ nome: string; media: string | number; }>;
  performance_por_portaria: Array<{ nome: string; media: string | number; }>;
  filtros: {
    cargos: string[];
    portarias: string[];
  };
}

// Tipos para a view (camelCase e com números corretos)
interface MetricasGerais {
  totalAvaliacoes: number;
  mediaGeral: number;
  totalAtendentes: number;
  distribuicaoNotas: Array<{ nota: number; quantidade: number; }>;
  tendenciaMensal: Array<{ mes: string; media: number; }>;
  performancePorCargo: Array<{ nome: string; media: number; }>;
  performancePorPortaria: Array<{ nome: string; media: number; }>;
  filtros: {
    cargos: string[];
    portarias: string[];
  };
}

interface DistribuicaoNotas {
  nota: number;
  quantidade: number;
}

interface TendenciaMensal {
  mes: string;
  media: number;
}

interface PerformanceCargoPortaria {
  nome: string;
  media: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(json => json.data);

export function MetricasGerais({ initialData: rawInitialData }: { initialData?: RawMetricasGerais }) {
  const [periodo, setPeriodo] = useState('ultimos_30_dias');
  const [cargo, setCargo] = useState('todos');
  const [portaria, setPortaria] = useState('todas');

  const url = `/api/consultor/metricas?periodo=${periodo}&cargo=${cargo}&portaria=${portaria}`;

  const { data: rawData, error, isLoading: swrLoading } = useSWR<RawMetricasGerais>(
    url,
    fetcher,
    {
      fallbackData: rawInitialData,
      revalidateOnFocus: false,
    }
  );

  const data = useMemo((): MetricasGerais | null => {
    if (!rawData) return null;
    try {
      return {
        totalAvaliacoes: rawData.total_avaliacoes,
        mediaGeral: Number(rawData.media_geral || 0),
        totalAtendentes: rawData.total_atendentes,
        distribuicaoNotas: rawData.distribuicao_notas,
        tendenciaMensal: rawData.tendencia_mensal.map((item): TendenciaMensal => ({
        mes: item.mes,
        media: Number(item.media || 0),
      })),
        performancePorCargo: rawData.performance_por_cargo.map((item): PerformanceCargoPortaria => ({
        nome: item.nome,
        media: Number(item.media || 0),
      })),
        performancePorPortaria: rawData.performance_por_portaria.map((item): PerformanceCargoPortaria => ({
        nome: item.nome,
        media: Number(item.media || 0),
      })),
        filtros: rawData.filtros,
      };
    } catch (e) {
      console.error("Erro ao transformar dados das métricas:", e);
      return null;
    }
  }, [rawData]);

  // Garantimos que o resultado seja sempre booleano
  const isLoading = swrLoading || (!!rawData && !data);

  if (error || (rawData && !data && !swrLoading)) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Métricas</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados de desempenho. Tente atualizar a página.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <FiltroSelect
          label="Período"
          value={periodo}
          onValueChange={setPeriodo}
          items={[
            { value: 'hoje', label: 'Hoje' },
            { value: 'ultimos_7_dias', label: 'Últimos 7 dias' },
            { value: 'ultimos_30_dias', label: 'Últimos 30 dias' },
            { value: 'mes_atual', label: 'Mês Atual' },
            { value: 'ano_atual', label: 'Ano Atual' },
          ]}
        />
        <FiltroSelect
          label="Cargo"
          value={cargo}
          onValueChange={setCargo}
          items={[{ value: 'todos', label: 'Todos os Cargos' }, ...(data?.filtros.cargos.map(c => ({ value: c, label: c })) || [])]}
          disabled={isLoading || !data?.filtros.cargos.length}
        />
        <FiltroSelect
          label="Portaria"
          value={portaria}
          onValueChange={setPortaria}
          items={[{ value: 'todas', label: 'Todas as Portarias' }, ...(data?.filtros.portarias.map(p => ({ value: p, label: p })) || [])]}
          disabled={isLoading || !data?.filtros.portarias.length}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CardResumo title="Total de Avaliações" value={data?.totalAvaliacoes} isLoading={isLoading} />
        <CardResumo title="Média Geral" value={data?.mediaGeral ? data.mediaGeral.toFixed(2) : 'N/A'} isLoading={isLoading} />
        <CardResumo title="Atendentes Avaliados" value={data?.totalAtendentes} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <CardDistribuicaoNotas data={data?.distribuicaoNotas} isLoading={isLoading} />
        <CardTendenciaMensal data={data?.tendenciaMensal} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <CardPerformancePorCargo data={data?.performancePorCargo} isLoading={isLoading} />
        <CardPerformancePorPortaria data={data?.performancePorPortaria} isLoading={isLoading} />
      </div>
    </div>
  );
}

// Helper components

function FiltroSelect({ label, value, onValueChange, items, disabled }: { label: string, value: string, onValueChange: (value: string) => void, items: { value: string, label: string }[], disabled?: boolean }) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Select onValueChange={onValueChange} defaultValue={value} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {items.map(item => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CardResumo({ title, value, isLoading }: { title: string, value?: string | number, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  );
}

function CardDistribuicaoNotas({ data, isLoading }: { data?: DistribuicaoNotas[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Notas</CardTitle>
        <CardDescription>Quantidade de avaliações por nota.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nota" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function CardTendenciaMensal({ data, isLoading }: { data?: TendenciaMensal[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência Mensal</CardTitle>
        <CardDescription>Média das notas ao longo do tempo.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="media" stroke="#82ca9d" name="Média" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function CardPerformancePorCargo({ data, isLoading }: { data?: PerformanceCargoPortaria[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Cargo</CardTitle>
        <CardDescription>Média de notas por cargo.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[1, 5]} />
              <YAxis type="category" dataKey="nome" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" fill="#ffc658" name="Média" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function CardPerformancePorPortaria({ data, isLoading }: { data?: PerformanceCargoPortaria[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Portaria</CardTitle>
        <CardDescription>Média de notas por portaria.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64 w-full" /> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[1, 5]} />
              <YAxis type="category" dataKey="nome" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" fill="#d0ed57" name="Média" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}