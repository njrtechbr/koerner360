/**
 * Hook customizado para formulários de atendentes
 * Facilita o uso das validações Zod e gerenciamento de estado
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  Atendente, 
  AtendenteFormData, 
  StatusAtendente 
} from '@/types/atendente';
import { 
  criarAtendenteSchema, 
  atualizarAtendenteSchema,
  formatarCPF,
  formatarTelefone
} from '@/lib/validations/atendente';

interface UseAtendenteFormProps {
  atendente?: Atendente;
  modo: 'criar' | 'editar';
  onSucesso?: (atendente: Atendente) => void;
  onErro?: (erro: string) => void;
}

interface UseAtendenteFormReturn {
  form: ReturnType<typeof useForm<AtendenteFormData>>;
  carregando: boolean;
  erro: string | null;
  onSubmit: (dados: AtendenteFormData) => Promise<void>;
  limparErro: () => void;
  formatarCampos: (dados: AtendenteFormData) => AtendenteFormData;
  validarCampo: (campo: keyof AtendenteFormData, valor: string | boolean | Date | null) => string | null;
}

/**
 * Hook para gerenciar formulários de atendentes
 */
export function useAtendenteForm({
  atendente,
  modo,
  onSucesso,
  onErro
}: UseAtendenteFormProps): UseAtendenteFormReturn {
  const router = useRouter();
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
      observacoes: atendente?.observacoes || '',
      avatarUrl: atendente?.foto_url || ''
    },
    mode: 'onChange' // Validação em tempo real
  });

  /**
   * Formatar campos antes do envio
   */
  const formatarCampos = (dados: AtendenteFormData): AtendenteFormData => {
    return {
      ...dados,
      nome: dados.nome.trim(),
      email: dados.email.toLowerCase().trim(),
      telefone: dados.telefone.replace(/\D/g, ''), // Remove formatação
      cpf: dados.cpf.replace(/\D/g, ''), // Remove formatação
      rg: dados.rg.replace(/\D/g, ''), // Remove formatação
      endereco: dados.endereco.trim(),
      setor: dados.setor.trim(),
      cargo: dados.cargo.trim(),
      portaria: dados.portaria.trim(),
      observacoes: dados.observacoes?.trim() || ''
    };
  };

  /**
   * Validar campo individual
   */
  const validarCampo = (campo: keyof AtendenteFormData, valor: string | boolean | Date | null): string | null => {
    try {
      const campoSchema = schema.shape[campo];
      if (campoSchema) {
        campoSchema.parse(valor);
      }
      return null;
    } catch (error: unknown) {
      const zodError = error as { issues?: Array<{ message: string }> };
      return zodError.issues?.[0]?.message || 'Valor inválido';
    }
  };

  /**
   * Submeter formulário
   */
  const onSubmit = async (dados: AtendenteFormData) => {
    try {
      setCarregando(true);
      setErro(null);

      // Formatar dados antes do envio
      const dadosFormatados = formatarCampos(dados);

      const url = modo === 'criar' 
        ? '/api/atendentes' 
        : `/api/atendentes/${atendente?.id}`;
      
      const metodo = modo === 'criar' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosFormatados),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Erro ao salvar atendente');
      }

      // Sucesso
      toast({
        title: modo === 'criar' ? 'Atendente criado' : 'Atendente atualizado',
        description: modo === 'criar' 
          ? 'O atendente foi criado com sucesso.' 
          : 'As informações do atendente foram atualizadas.',
      });

      if (onSucesso) {
        onSucesso(resultado.data.atendente);
      } else {
        router.push('/atendentes');
      }
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro inesperado';
      
      console.error('Erro ao salvar atendente:', error);
      setErro(mensagemErro);
      
      toast({
        title: 'Erro',
        description: mensagemErro,
        variant: 'destructive',
      });

      if (onErro) {
        onErro(mensagemErro);
      }
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Limpar erro
   */
  const limparErro = () => {
    setErro(null);
  };

  return {
    form,
    carregando,
    erro,
    onSubmit,
    limparErro,
    formatarCampos,
    validarCampo
  };
}

/**
 * Hook para validação em tempo real de campos específicos
 */
export function useValidacaoAtendente() {
  /**
   * Validar CPF em tempo real
   */
  const validarCPF = (cpf: string): { valido: boolean; mensagem?: string } => {
    try {
      criarAtendenteSchema.shape.cpf.parse(cpf);
      return { valido: true };
    } catch (error: unknown) {
      const zodError = error as { issues?: Array<{ message: string }> };
      return { 
        valido: false, 
        mensagem: zodError.issues?.[0]?.message || 'CPF inválido' 
      };
    }
  };

  /**
   * Validar email em tempo real
   */
  const validarEmail = (email: string): { valido: boolean; mensagem?: string } => {
    try {
      criarAtendenteSchema.shape.email.parse(email);
      return { valido: true };
    } catch (error: unknown) {
      const zodError = error as { issues?: Array<{ message: string }> };
      return { 
        valido: false, 
        mensagem: zodError.issues?.[0]?.message || 'Email inválido' 
      };
    }
  };

  /**
   * Validar telefone em tempo real
   */
  const validarTelefone = (telefone: string): { valido: boolean; mensagem?: string } => {
    try {
      criarAtendenteSchema.shape.telefone.parse(telefone);
      return { valido: true };
    } catch (error: unknown) {
      const zodError = error as { issues?: Array<{ message: string }> };
      return { 
        valido: false, 
        mensagem: zodError.issues?.[0]?.message || 'Telefone inválido' 
      };
    }
  };

  /**
   * Formatar CPF enquanto digita
   */
  const formatarCPFInput = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    return formatarCPF(apenasNumeros);
  };

  /**
   * Formatar telefone enquanto digita
   */
  const formatarTelefoneInput = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    return formatarTelefone(apenasNumeros);
  };

  return {
    validarCPF,
    validarEmail,
    validarTelefone,
    formatarCPFInput,
    formatarTelefoneInput
  };
}