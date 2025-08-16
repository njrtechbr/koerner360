import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth.ts';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';

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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos', details: validacao.error.errors },
        { status: 400 }
      );
    }

    // Validar arquivo
    if (!arquivo) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!arquivo.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo 5MB permitido' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      data: {
        url: urlPublica,
        nomeArquivo,
        tamanho: arquivo.size,
        tipo: arquivo.type
      },
      message: 'Arquivo enviado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
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
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL do arquivo é obrigatória' },
        { status: 400 }
      );
    }

    // Construir caminho do arquivo
    const caminhoArquivo = join(process.cwd(), 'public', url);
    
    // Verificar se arquivo existe e remover
    if (existsSync(caminhoArquivo)) {
      const { unlink } = await import('fs/promises');
      await unlink(caminhoArquivo);
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo removido com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}