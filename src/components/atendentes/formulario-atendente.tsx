/**
 * Componente de formulário para criação e edição de atendentes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Atendente, 
  AtendenteFormData, 
  StatusAtendente,
  STATUS_ATENDENTE_LABELS,
  STATUS_ATENDENTE_CORES 
} from '@/types/atendente';
import { 
  criarAtendenteSchema, 
  atualizarAtendenteSchema 
} from '@/lib/validations/atendente';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { UploadFoto } from '@/components/ui/upload-foto';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';

interface FormularioAtendenteProps {
  atendente?: Atendente;
  modo: 'criar' | 'editar';
  onSucesso?: (atendente: Atendente) => void;
  onCancelar?: () => void;
}

/**
 * Componente de formulário para atendentes
 */
export function FormularioAtendente({
  atendente,
  modo,
  onSucesso,
  onCancelar
}: FormularioAtendenteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(
    atendente?.foto_url || null
  );

  // Configurar schema de validação baseado no modo
  const schema = modo === 'criar' ? criarAtendenteSchema : atualizarAtendenteSchema;

  // Configurar formulário
  const form = useForm<AtendenteFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: atendente?.nome || '',
      email: atendente?.email || '',
      telefone: atendente?.telefone || '',
      cpf: atendente?.cpf || '',
      rg: atendente?.rg || '',
      endereco: atendente?.endereco || '',
      setor: atendente?.setor || '',
      cargo: atendente?.cargo || '',
      portaria: atendente?.portaria || '',
      dataAdmissao: atendente?.data_admissao 
        ? new Date(atendente.data_admissao).toISOString().split('T')[0] 
        : '',
      dataNascimento: atendente?.data_nascimento 
        ? new Date(atendente.data_nascimento).toISOString().split('T')[0] 
        : '',
      status: atendente?.status || StatusAtendente.ATIVO,
      observacoes: atendente?.observacoes || ''
    }
  });

  /**
   * Submeter formulário
   */
  const onSubmit = async (dados: AtendenteFormData) => {
    try {
      setCarregando(true);

      const url = modo === 'criar' 
        ? '/api/atendentes' 
        : `/api/atendentes/${atendente?.id}`;
      
      const metodo = modo === 'criar' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Erro ao salvar atendente');
      }

      toast({
        title: modo === 'criar' ? 'Atendente criado' : 'Atendente atualizado',
        description: modo === 'criar' 
          ? 'O atendente foi criado com sucesso.' 
          : 'As informações do atendente foram atualizadas.',
      });

      if (onSucesso) {
        onSucesso(resultado.data);
      } else {
        router.push('/atendentes');
      }
    } catch (error) {
      console.error('Erro ao salvar atendente:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Cancelar edição
   */
  const handleCancelar = () => {
    if (onCancelar) {
      onCancelar();
    } else {
      router.back();
    }
  };

  /**
   * Upload de foto
   */
  const handleUploadCompleto = (url: string) => {
    setFotoUrl(url);
  };

  /**
   * Remover foto
   */
  const handleRemoverFoto = () => {
    setFotoUrl(null);
  };

  /**
   * Obter iniciais do nome
   */
  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(parte => parte.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {modo === 'criar' ? 'Novo Atendente' : 'Editar Atendente'}
          </h1>
          <p className="text-muted-foreground">
            {modo === 'criar' 
              ? 'Preencha as informações para criar um novo atendente' 
              : 'Atualize as informações do atendente'
            }
          </p>
        </div>
        
        {atendente && (
          <Badge 
            variant="outline" 
            className={`${STATUS_ATENDENTE_CORES[atendente.status]} border-current`}
          >
            {STATUS_ATENDENTE_LABELS[atendente.status]}
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Foto do Atendente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Foto do Atendente
              </CardTitle>
              <CardDescription>
                Adicione uma foto para identificação do atendente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadFoto
                fotoUrl={fotoUrl}
                nome={form.watch('nome') || 'Atendente'}
                onUploadCompleto={handleUploadCompleto}
                onRemover={handleRemoverFoto}
                entidade="atendente"
                entidadeId={atendente?.id}
                tamanho="lg"
                permiteRemover={true}
              />
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="email@exemplo.com" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            placeholder="(11) 99999-9999" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea 
                          placeholder="Endereço completo" 
                          className="pl-10 min-h-[80px]"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="setor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Limpeza, Segurança" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Auxiliar, Supervisor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portaria *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Portaria 1, Portaria 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataAdmissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Admissão *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(STATUS_ATENDENTE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className={`w-2 h-2 rounded-full ${STATUS_ATENDENTE_CORES[key as StatusAtendente]}`}
                                />
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
              <CardDescription>
                Informações adicionais sobre o atendente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite observações adicionais sobre o atendente..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Estas informações são opcionais e podem incluir detalhes sobre desempenho, 
                      treinamentos ou outras observações relevantes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelar}
              disabled={carregando}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            
            <Button type="submit" disabled={carregando}>
              {carregando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {modo === 'criar' ? 'Criar Atendente' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}