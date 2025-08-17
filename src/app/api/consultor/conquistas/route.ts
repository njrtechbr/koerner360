import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { conquistasParamsSchema } from '@/lib/validations/consultor'
import { hasPermission } from '@/hooks/use-permissions'
import type { TipoUsuario } from '@/hooks/use-permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado', timestamp: new Date().toISOString() },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userType = session.user.userType as TipoUsuario
    if (!hasPermission(userType, 'podeVisualizarConquistas')) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar conquistas', timestamp: new Date().toISOString() },
        { status: 403 }
      )
    }

    // Validar parâmetros da query
    const { searchParams } = new URL(request.url)
    const validatedParams = conquistasParamsSchema.parse({
      atendenteId: searchParams.get('atendenteId'),
      categoria: searchParams.get('categoria'),
      tipo: searchParams.get('tipo'),
      ativo: searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined,
      limite: searchParams.get('limite') ? parseInt(searchParams.get('limite')!) : undefined,
    })

    // Construir filtros
    const whereConquistas: Record<string, unknown> = {
      ativo: validatedParams.ativo ?? true,
    }

    if (validatedParams.categoria) {
      whereConquistas.categoria = validatedParams.categoria
    }

    if (validatedParams.tipo) {
      whereConquistas.tipo = validatedParams.tipo
    }

    // Se atendenteId for fornecido, buscar conquistas específicas do atendente
    if (validatedParams.atendenteId) {
      const conquistasAtendente = await prisma.conquistaAtendente.findMany({
        where: {
          atendenteId: validatedParams.atendenteId,
        },
        include: {
          conquista: {
            where: whereConquistas,
          },
          atendente: {
            select: {
              id: true,
              nome: true,
              cargo: true,
              portaria: true,
              usuario: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          dataConquista: 'desc',
        },
        take: validatedParams.limite,
      })

      const conquistasFormatadas = conquistasAtendente
        .filter(ca => ca.conquista) // Filtrar conquistas que passaram no where
        .map(ca => ({
          id: ca.conquista.id,
          nome: ca.conquista.nome,
          descricao: ca.conquista.descricao,
          icone: ca.conquista.icone,
          categoria: ca.conquista.categoria,
          tipo: ca.conquista.tipo,
          criterio: ca.conquista.criterio,
          valorMeta: ca.conquista.valorMeta,
          pontos: ca.conquista.pontos,
          ativo: ca.conquista.ativo,
          dataConquista: ca.dataConquista.toISOString(),
          atendente: {
            id: ca.atendente.id,
            nome: ca.atendente.nome,
            cargo: ca.atendente.cargo,
            portaria: ca.atendente.portaria,
            avatarUrl: ca.atendente.usuario?.avatarUrl,
          },
        }))

      return NextResponse.json({
        success: true,
        data: {
          conquistas: conquistasFormatadas,
          total: conquistasFormatadas.length,
          atendenteId: validatedParams.atendenteId,
        },
        timestamp: new Date().toISOString(),
      })
    }

    // Buscar todas as conquistas disponíveis
    const conquistas = await prisma.conquista.findMany({
      where: whereConquistas,
      include: {
        _count: {
          select: {
            conquistaAtendentes: true,
          },
        },
      },
      orderBy: [
        { categoria: 'asc' },
        { tipo: 'asc' },
        { valorMeta: 'asc' },
      ],
      take: validatedParams.limite,
    })

    const conquistasFormatadas = conquistas.map(conquista => ({
      id: conquista.id,
      nome: conquista.nome,
      descricao: conquista.descricao,
      icone: conquista.icone,
      categoria: conquista.categoria,
      tipo: conquista.tipo,
      criterio: conquista.criterio,
      valorMeta: conquista.valorMeta,
      pontos: conquista.pontos,
      ativo: conquista.ativo,
      totalConquistadores: conquista._count.conquistaAtendentes,
      criadoEm: conquista.criadoEm.toISOString(),
      atualizadoEm: conquista.atualizadoEm.toISOString(),
    }))

    // Estatísticas gerais
    const estatisticas = {
      totalConquistas: conquistas.length,
      porCategoria: {} as Record<string, number>,
      porTipo: {} as Record<string, number>,
    }

    conquistas.forEach(conquista => {
      // Contar por categoria
      if (!estatisticas.porCategoria[conquista.categoria]) {
        estatisticas.porCategoria[conquista.categoria] = 0
      }
      estatisticas.porCategoria[conquista.categoria]++

      // Contar por tipo
      if (!estatisticas.porTipo[conquista.tipo]) {
        estatisticas.porTipo[conquista.tipo] = 0
      }
      estatisticas.porTipo[conquista.tipo]++
    })

    return NextResponse.json({
      success: true,
      data: {
        conquistas: conquistasFormatadas,
        estatisticas,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parâmetros inválidos', 
          details: error.message,
          timestamp: new Date().toISOString() 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}