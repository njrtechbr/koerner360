/**
 * Schemas de validação Zod para atendentes
 * Validações para formulários e API do sistema de atendentes
 */

import { z } from 'zod';

// Regex para validação de CPF
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

// Regex para validação de RG
const rgRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9X]$|^[0-9]{7,9}[0-9X]$/;

// Regex para telefone (formato brasileiro)
const telefoneRegex = /^\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;

// Schema base para atendente
export const atendenteBaseSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  status: z.nativeEnum({
    ATIVO: 'ATIVO',
    FERIAS: 'FERIAS', 
    AFASTADO: 'AFASTADO',
    INATIVO: 'INATIVO'
  } as const),
  
  avatarUrl: z
    .string()
    .url('URL do avatar inválida')
    .optional()
    .or(z.literal('')),
  
  telefone: z
    .string()
    .regex(telefoneRegex, 'Formato de telefone inválido. Use (XX) XXXXX-XXXX')
    .transform(val => val.replace(/\D/g, '')), // Remove caracteres não numéricos
  
  portaria: z
    .string()
    .min(1, 'Portaria é obrigatória')
    .max(50, 'Portaria deve ter no máximo 50 caracteres'),
  
  dataAdmissao: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de admissão deve estar no formato YYYY-MM-DD')
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, 'Data de admissão inválida ou futura'),
  
  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
    .refine(val => {
      const date = new Date(val);
      const hoje = new Date();
      const idade = hoje.getFullYear() - date.getFullYear();
      return !isNaN(date.getTime()) && date < hoje && idade >= 16 && idade <= 100;
    }, 'Data de nascimento inválida. Idade deve estar entre 16 e 100 anos'),
  
  endereco: z
    .string()
    .min(1, 'Endereço é obrigatório')
    .max(255, 'Endereço deve ter no máximo 255 caracteres'),
  
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  
  rg: z
    .string()
    .regex(rgRegex, 'Formato de RG inválido')
    .transform(val => val.replace(/\D/g, '')), // Remove caracteres não numéricos
  
  cpf: z
    .string()
    .regex(cpfRegex, 'Formato de CPF inválido')
    .transform(val => val.replace(/\D/g, '')) // Remove caracteres não numéricos
    .refine(validarCPF, 'CPF inválido'),
  
  setor: z
    .string()
    .min(1, 'Setor é obrigatório')
    .max(50, 'Setor deve ter no máximo 50 caracteres'),
  
  cargo: z
    .string()
    .min(1, 'Cargo é obrigatório')
    .max(50, 'Cargo deve ter no máximo 50 caracteres')
});

// Schema para criação de atendente
export const criarAtendenteSchema = atendenteBaseSchema;

// Schema para atualização de atendente (todos os campos opcionais)
export const atualizarAtendenteSchema = atendenteBaseSchema.partial();

// Schema para filtros de busca
export const filtrosAtendenteSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum({
    ATIVO: 'ATIVO',
    FERIAS: 'FERIAS',
    AFASTADO: 'AFASTADO', 
    INATIVO: 'INATIVO'
  } as const).optional(),
  setor: z.string().optional(),
  cargo: z.string().optional(),
  portaria: z.string().optional(),
  ativo: z.boolean().optional()
});

// Schema para paginação
export const paginacaoSchema = z.object({
  pagina: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'Página deve ser maior que 0'),
  
  limite: z
    .string()
    .optional()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100')
});

// Schema para ordenação
export const ordenacaoSchema = z.object({
  coluna: z.enum([
    'nome',
    'email',
    'status',
    'setor',
    'cargo',
    'portaria',
    'dataAdmissao',
    'criadoEm'
  ]).optional().default('nome'),
  
  direcao: z.enum(['asc', 'desc']).optional().default('asc')
});

// Schema para parâmetros de query da API
export const queryAtendenteSchema = filtrosAtendenteSchema
  .merge(paginacaoSchema)
  .merge(ordenacaoSchema);

// Tipos inferidos dos schemas
export type CriarAtendenteInput = z.infer<typeof criarAtendenteSchema>;
export type AtualizarAtendenteInput = z.infer<typeof atualizarAtendenteSchema>;
export type FiltrosAtendenteInput = z.infer<typeof filtrosAtendenteSchema>;
export type QueryAtendenteInput = z.infer<typeof queryAtendenteSchema>;

/**
 * Função para validar CPF
 * @param cpf - CPF sem formatação (apenas números)
 * @returns true se o CPF for válido
 */
function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digitoVerificador1 = resto < 2 ? 0 : resto;
  
  if (parseInt(cpfLimpo.charAt(9)) !== digitoVerificador1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digitoVerificador2 = resto < 2 ? 0 : resto;
  
  return parseInt(cpfLimpo.charAt(10)) === digitoVerificador2;
}

/**
 * Função para formatar CPF
 * @param cpf - CPF sem formatação
 * @returns CPF formatado (XXX.XXX.XXX-XX)
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '').slice(0, 11);
  
  if (cpfLimpo.length >= 11) {
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cpfLimpo.length >= 9) {
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
  } else if (cpfLimpo.length >= 6) {
    return cpfLimpo.replace(/(\d{3})(\d{3})/, '$1.$2');
  } else if (cpfLimpo.length >= 3) {
    return cpfLimpo.replace(/(\d{3})/, '$1.');
  }
  
  return cpfLimpo;
}

/**
 * Função para formatar telefone
 * @param telefone - Telefone sem formatação
 * @returns Telefone formatado
 */
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, '').slice(0, 11);
  
  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}