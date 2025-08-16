/**
 * Componente para exibir validação visual de campos
 * Mostra status de validação em tempo real
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidacaoCampoProps {
  valor: string;
  validador: (valor: string) => { valido: boolean; mensagem?: string };
  mostrarSempre?: boolean;
  className?: string;
  debounceMs?: number;
}

/**
 * Componente de validação visual para campos
 */
export function ValidacaoCampo({
  valor,
  validador,
  mostrarSempre = false,
  className,
  debounceMs = 300
}: ValidacaoCampoProps) {
  const [validacao, setValidacao] = useState<{
    valido: boolean;
    mensagem?: string;
  } | null>(null);
  const [validando, setValidando] = useState(false);
  const [mostrar, setMostrar] = useState(mostrarSempre);

  useEffect(() => {
    if (!valor && !mostrarSempre) {
      setValidacao(null);
      setMostrar(false);
      return;
    }

    setValidando(true);
    setMostrar(true);

    const timer = setTimeout(() => {
      const resultado = validador(valor);
      setValidacao(resultado);
      setValidando(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [valor, validador, debounceMs, mostrarSempre]);

  if (!mostrar && !validacao) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {validando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Validando...</span>
        </>
      ) : validacao ? (
        <>
          {validacao.valido ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Válido</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{validacao.mensagem}</span>
            </>
          )}
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-600">Aguardando entrada</span>
        </>
      )}
    </div>
  );
}

/**
 * Componente de indicador de força de senha
 */
interface IndicadorForcaSenhaProps {
  senha: string;
  className?: string;
}

export function IndicadorForcaSenha({ senha, className }: IndicadorForcaSenhaProps) {
  const calcularForca = (senha: string): {
    nivel: 'fraca' | 'media' | 'forte' | 'muito-forte';
    pontuacao: number;
    criterios: {
      tamanho: boolean;
      maiuscula: boolean;
      minuscula: boolean;
      numero: boolean;
      especial: boolean;
    };
  } => {
    const criterios = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };

    const pontuacao = Object.values(criterios).filter(Boolean).length;

    let nivel: 'fraca' | 'media' | 'forte' | 'muito-forte';
    if (pontuacao <= 2) nivel = 'fraca';
    else if (pontuacao === 3) nivel = 'media';
    else if (pontuacao === 4) nivel = 'forte';
    else nivel = 'muito-forte';

    return { nivel, pontuacao, criterios };
  };

  if (!senha) {
    return null;
  }

  const { nivel, pontuacao, criterios } = calcularForca(senha);

  const cores = {
    'fraca': 'bg-red-500',
    'media': 'bg-yellow-500',
    'forte': 'bg-blue-500',
    'muito-forte': 'bg-green-500'
  };

  const labels = {
    'fraca': 'Fraca',
    'media': 'Média',
    'forte': 'Forte',
    'muito-forte': 'Muito Forte'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Barra de força */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-sm transition-colors',
              i <= pontuacao ? cores[nivel] : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Label e critérios */}
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          'font-medium',
          nivel === 'fraca' && 'text-red-600',
          nivel === 'media' && 'text-yellow-600',
          nivel === 'forte' && 'text-blue-600',
          nivel === 'muito-forte' && 'text-green-600'
        )}>
          {labels[nivel]}
        </span>
        <span className="text-muted-foreground">
          {pontuacao}/5 critérios
        </span>
      </div>

      {/* Lista de critérios */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={cn(
          'flex items-center gap-1',
          criterios.tamanho ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {criterios.tamanho ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          8+ caracteres
        </div>
        <div className={cn(
          'flex items-center gap-1',
          criterios.maiuscula ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {criterios.maiuscula ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          Maiúscula
        </div>
        <div className={cn(
          'flex items-center gap-1',
          criterios.minuscula ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {criterios.minuscula ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          Minúscula
        </div>
        <div className={cn(
          'flex items-center gap-1',
          criterios.numero ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {criterios.numero ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          Número
        </div>
        <div className={cn(
          'flex items-center gap-1 col-span-2',
          criterios.especial ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {criterios.especial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          Caractere especial
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de validação para CPF
 */
interface ValidacaoCPFProps {
  cpf: string;
  className?: string;
}

export function ValidacaoCPF({ cpf, className }: ValidacaoCPFProps) {
  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      return { valido: false, mensagem: 'CPF deve ter 11 dígitos' };
    }
    
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return { valido: false, mensagem: 'CPF não pode ter todos os dígitos iguais' };
    }
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digitoVerificador1 = resto < 2 ? 0 : resto;
    
    if (parseInt(cpfLimpo.charAt(9)) !== digitoVerificador1) {
      return { valido: false, mensagem: 'CPF inválido' };
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digitoVerificador2 = resto < 2 ? 0 : resto;
    
    if (parseInt(cpfLimpo.charAt(10)) !== digitoVerificador2) {
      return { valido: false, mensagem: 'CPF inválido' };
    }
    
    return { valido: true, mensagem: 'CPF válido' };
  };

  return (
    <ValidacaoCampo
      valor={cpf}
      validador={validarCPF}
      className={className}
    />
  );
}

/**
 * Componente de validação para email
 */
interface ValidacaoEmailProps {
  email: string;
  className?: string;
}

export function ValidacaoEmail({ email, className }: ValidacaoEmailProps) {
  const validarEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { valido: false, mensagem: 'Email é obrigatório' };
    }
    
    if (!emailRegex.test(email)) {
      return { valido: false, mensagem: 'Formato de email inválido' };
    }
    
    return { valido: true, mensagem: 'Email válido' };
  };

  return (
    <ValidacaoCampo
      valor={email}
      validador={validarEmail}
      className={className}
    />
  );
}