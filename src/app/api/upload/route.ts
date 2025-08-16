import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
  validateAuthentication
} from '@/lib/api-response';

// Schema de validação para upload
const uploadSchema = z.object({
  tipo: z.enum(['avatar', 'documento']),
  entidade: z.enum(['atendente', 'usuario']),
  entidadeId: z.string().optional()
});

/**
 * POST /api/upload
 * Faz upload de arquivos (imagens)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    // Obter dados do FormData
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File;
    const tipo = formData.get('tipo') as string;
    const entidade = formData.get('entidade') as string;
    const entidadeId = formData.get('entidadeId') as string;

    // Validar parâmetros
    const validacao = uploadSchema.safeParse({ tipo, entidade, entidadeId });
    if (!validacao.success) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Parâmetros inválidos',
        validacao.error.issues
      );
    }

    // Validar arquivo
    if (!arquivo) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Nenhum arquivo enviado'
      );
    }

    // Validar tipo de arquivo
    if (!arquivo.type.startsWith('image/')) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Apenas arquivos de imagem são permitidos'
      );
    }

    // Validar tamanho (máximo 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Arquivo muito grande. Máximo 5MB permitido'
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `${entidade}_${tipo}_${timestamp}.${extensao}`;

    // Definir diretório de upload
    const uploadDir = join(process.cwd(), 'public', 'uploads', entidade, tipo);
    
    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Caminho completo do arquivo
    const caminhoArquivo = join(uploadDir, nomeArquivo);
    
    // Converter arquivo para buffer e salvar
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(caminhoArquivo, buffer);

    // URL pública do arquivo
    const urlPublica = `/uploads/${entidade}/${tipo}/${nomeArquivo}`;

    return createSuccessResponse(
      {
        url: urlPublica,
        nomeArquivo,
        tamanho: arquivo.size,
        tipo: arquivo.type
      },
      'Arquivo enviado com sucesso'
    );

  } catch (error) {
    console.error('Erro no upload:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}

/**
 * DELETE /api/upload
 * Remove arquivo do servidor
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    
    const authResult = validateAuthentication(session);
    if (authResult) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'URL do arquivo é obrigatória'
      );
    }

    // Construir caminho do arquivo
    const caminhoArquivo = join(process.cwd(), 'public', url);
    
    // Verificar se arquivo existe e remover
    if (existsSync(caminhoArquivo)) {
      const { unlink } = await import('fs/promises');
      await unlink(caminhoArquivo);
    }

    return createSuccessResponse(
      { url },
      'Arquivo removido com sucesso'
    );

  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Erro interno do servidor'
    );
  }
}