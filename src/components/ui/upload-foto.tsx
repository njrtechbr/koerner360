'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { Upload, X, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSonnerToast } from '@/hooks/use-sonner-toast';
import { logError } from '@/lib/error-utils';

interface UploadFotoProps {
  /** URL atual da foto */
  fotoUrl?: string;
  /** Nome para exibir no avatar fallback */
  nome?: string;
  /** Callback executado quando upload é concluído */
  onUploadCompleto?: (url: string) => void;
  /** Callback executado quando foto é removida */
  onRemover?: () => void;
  /** Tipo de entidade (atendente, usuario) */
  entidade: 'atendente' | 'usuario';
  /** ID da entidade (opcional) */
  entidadeId?: string;
  /** Tamanho do avatar */
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
  /** Se deve mostrar botão de remoção */
  permiteRemover?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

const tamanhos = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40'
};

/**
 * Componente para upload de fotos com preview
 * Suporta drag & drop, validação de arquivo e upload automático
 */
function UploadFotoComponent({
  fotoUrl,
  nome = 'Usuario',
  onUploadCompleto,
  onRemover,
  entidade,
  entidadeId,
  tamanho = 'lg',
  permiteRemover = true,
  className
}: UploadFotoProps) {
  const { showSuccess, showError } = useSonnerToast();
  const [carregando, setCarregando] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validar arquivo
  const validarArquivo = useCallback((arquivo: File): string | null => {
    // Verificar tipo
    if (!arquivo.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    // Verificar tamanho (máximo 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      return 'Arquivo muito grande. Máximo 5MB permitido';
    }

    // Verificar extensão
    const extensoesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];
    const extensao = arquivo.name.split('.').pop()?.toLowerCase();
    if (!extensao || !extensoesPermitidas.includes(extensao)) {
      return 'Formato não suportado. Use JPG, PNG ou WebP';
    }

    return null;
  }, []);

  // Fazer upload do arquivo
  const fazerUpload = useCallback(async (arquivo: File) => {
    setCarregando(true);

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      formData.append('tipo', 'avatar');
      formData.append('entidade', entidade);
      if (entidadeId) {
        formData.append('entidadeId', entidadeId);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const resultado = await response.json();

      if (!resultado.success) {
        throw new Error(resultado.error || 'Erro no upload');
      }

      // Limpar preview local
      setPreviewUrl(null);
      
      // Notificar sucesso
      showSuccess(
        'Foto enviada com sucesso! A imagem foi carregada e está disponível.'
      );
      
      // Callback de sucesso
      onUploadCompleto?.(resultado.data.url);

    } catch (error) {
      logError('Erro no upload', error);
      showError(
        `Erro no upload: ${error instanceof Error ? error.message : 'Erro inesperado no upload'}`
      );
      setPreviewUrl(null);
    } finally {
      setCarregando(false);
    }
  }, [entidade, entidadeId, onUploadCompleto, showSuccess, showError]);

  // Processar arquivo selecionado
  const processarArquivo = useCallback((arquivo: File) => {
    const erro = validarArquivo(arquivo);
    if (erro) {
      showError(
        `Arquivo inválido: ${erro}`
      );
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(arquivo);

    // Fazer upload
    fazerUpload(arquivo);
  }, [validarArquivo, fazerUpload, showError]);

  // Handlers de eventos
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      processarArquivo(arquivo);
    }
  }, [processarArquivo]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const arquivo = e.dataTransfer.files[0];
    if (arquivo) {
      processarArquivo(arquivo);
    }
  }, [processarArquivo]);

  const handleRemover = useCallback(async () => {
    if (!fotoUrl) return;

    try {
      // Remover arquivo do servidor
      await fetch(`/api/upload?url=${encodeURIComponent(fotoUrl)}`, {
        method: 'DELETE'
      });

      showSuccess(
        'Foto removida com sucesso! A imagem foi excluída do sistema.'
      );
      onRemover?.();
    } catch (error) {
      logError('Erro ao remover foto', error);
      showError(
        'Erro ao remover foto: Não foi possível excluir a imagem'
      );
    }
  }, [fotoUrl, onRemover, showSuccess, showError]);

  const urlFoto = previewUrl || fotoUrl;
  const iniciais = nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar com overlay de upload */}
      <div 
        className={cn(
          'relative group cursor-pointer',
          tamanhos[tamanho],
          isDragOver && 'ring-2 ring-primary ring-offset-2'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Avatar className={cn('h-full w-full', carregando && 'opacity-50')}>
          <AvatarImage src={urlFoto} alt={nome} />
          <AvatarFallback className="text-lg font-semibold">
            {iniciais}
          </AvatarFallback>
        </Avatar>

        {/* Overlay de upload */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
          {carregando ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Botão de remoção */}
        {permiteRemover && urlFoto && !carregando && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleRemover();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={carregando}
        >
          <Upload className="h-4 w-4 mr-2" />
          {urlFoto ? 'Alterar Foto' : 'Enviar Foto'}
        </Button>
      </div>

      {/* Instruções */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Clique ou arraste uma imagem aqui.<br />
        Formatos: JPG, PNG, WebP (máx. 5MB)
      </p>
    </div>
  );
}

export const UploadFoto = memo(UploadFotoComponent);