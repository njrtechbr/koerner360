/**
 * Hook customizado para notificações usando Sonner
 * Fornece uma interface padronizada para exibir alertas de erro, sucesso e informativos
 */

import { toast } from 'sonner';

export interface ToastOptions {
  /** Título da notificação */
  title?: string;
  /** Descrição da notificação */
  description?: string;
  /** Duração em milissegundos (padrão: 4000) */
  duration?: number;
  /** Ação personalizada */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UseToastReturn {
  /** Exibe notificação de sucesso */
  success: (message: string, options?: ToastOptions) => void;
  /** Exibe notificação de erro */
  error: (message: string, options?: ToastOptions) => void;
  /** Exibe notificação informativa */
  info: (message: string, options?: ToastOptions) => void;
  /** Exibe notificação de aviso */
  warning: (message: string, options?: ToastOptions) => void;
  /** Exibe notificação de carregamento */
  loading: (message: string, options?: Omit<ToastOptions, 'duration'>) => string;
  /** Atualiza uma notificação existente */
  update: (id: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  /** Dismisses uma notificação específica */
  dismiss: (id?: string) => void;
  /** Alias para success - compatibilidade */
  showSuccess: (message: string, options?: ToastOptions) => void;
  /** Alias para error - compatibilidade */
  showError: (message: string, options?: ToastOptions) => void;
  /** Alias para info - compatibilidade */
  showInfo: (message: string, options?: ToastOptions) => void;
  /** Alias para warning - compatibilidade */
  showWarning: (message: string, options?: ToastOptions) => void;
}

/**
 * Hook para gerenciar notificações com Sonner
 * Fornece métodos padronizados para diferentes tipos de notificação
 */
export function useSonnerToast(): UseToastReturn {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000, // Erros ficam mais tempo
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000, // Avisos ficam um pouco mais tempo
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const loading = (message: string, options?: Omit<ToastOptions, 'duration'>) => {
    const toastId = toast.loading(message, {
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
    return String(toastId);
  };

  const update = (id: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        toast.success(message, { id });
        break;
      case 'error':
        toast.error(message, { id });
        break;
      case 'info':
        toast.info(message, { id });
        break;
      case 'warning':
        toast.warning(message, { id });
        break;
    }
  };

  const dismiss = (id?: string) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    update,
    dismiss,
    // Aliases para compatibilidade
    showSuccess: success,
    showError: error,
    showInfo: info,
    showWarning: warning,
  };
}

// Exportar funções diretas para uso sem hook
export const sonnerToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },
  loading: (message: string, options?: Omit<ToastOptions, 'duration'>) => {
    return toast.loading(message, {
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },
  dismiss: toast.dismiss,
};