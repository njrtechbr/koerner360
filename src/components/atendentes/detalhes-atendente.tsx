/**
 * Componente para exibir detalhes completos do atendente
 */

'use client';

import { Atendente, StatusAtendente } from '@/types/atendente';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  IdCard, 
  Briefcase, 
  Building,
  Clock,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { formatarCPF, formatarTelefone } from '@/lib/validations/atendente';
import { STATUS_ATENDENTE_LABELS, STATUS_ATENDENTE_CORES } from '@/types/atendente';

interface DetalhesAtendenteProps {
  atendente: Atendente;
}



/**
 * Componente de detalhes do atendente
 */
export function DetalhesAtendente({ atendente }: DetalhesAtendenteProps) {
  
  // Obter iniciais do nome para o avatar
  const iniciais = atendente.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Card principal com foto e informações básicas */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={atendente.avatarUrl || undefined} alt={atendente.nome} />
              <AvatarFallback className="text-lg">{iniciais}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{atendente.nome}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Badge 
              variant={STATUS_ATENDENTE_CORES[atendente.status] as "default" | "secondary" | "destructive" | "outline"}
              className="text-xs"
            >
              {STATUS_ATENDENTE_LABELS[atendente.status]}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{atendente.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatarTelefone(atendente.telefone)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{atendente.portaria}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button asChild>
              <Link href={`/atendentes/${atendente.id}?tab=editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Informações
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações profissionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Setor</p>
                <p className="text-sm text-muted-foreground">{atendente.setor}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cargo</p>
                <p className="text-sm text-muted-foreground">{atendente.cargo}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de Admissão</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(atendente.dataAdmissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tempo de Empresa</p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(
                    (new Date().getTime() - new Date(atendente.dataAdmissao).getTime()) / 
                    (1000 * 60 * 60 * 24 * 30)
                  )} meses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Informações pessoais */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium mb-1">CPF</p>
              <p className="text-sm text-muted-foreground">{formatarCPF(atendente.cpf)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">RG</p>
              <p className="text-sm text-muted-foreground">{atendente.rg}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Data de Nascimento</p>
              <p className="text-sm text-muted-foreground">
                {new Date(atendente.dataNascimento).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Idade</p>
              <p className="text-sm text-muted-foreground">
                {Math.floor(
                  (new Date().getTime() - new Date(atendente.dataNascimento).getTime()) / 
                  (1000 * 60 * 60 * 24 * 365)
                )} anos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do sistema */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium mb-1">Criado em</p>
              <p className="text-sm text-muted-foreground">
                {new Date(atendente.criadoEm).toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Última atualização</p>
              <p className="text-sm text-muted-foreground">
                {new Date(atendente.atualizadoEm).toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">ID do Sistema</p>
              <p className="text-sm text-muted-foreground font-mono">{atendente.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}