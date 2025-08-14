'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginacaoInfo {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

interface PaginacaoUsuariosProps {
  paginacao: PaginacaoInfo;
  onPaginaChange: (pagina: number) => void;
  onItensPorPaginaChange: (itens: number) => void;
  carregando?: boolean;
}

export function PaginacaoUsuarios({
  paginacao,
  onPaginaChange,
  onItensPorPaginaChange,
  carregando = false,
}: PaginacaoUsuariosProps) {
  const {
    paginaAtual,
    totalPaginas,
    totalItens,
    itensPorPagina,
    temProximaPagina,
    temPaginaAnterior,
  } = paginacao;

  // Calcular range de itens exibidos
  const primeiroItem = (paginaAtual - 1) * itensPorPagina + 1;
  const ultimoItem = Math.min(paginaAtual * itensPorPagina, totalItens);

  // Gerar números de páginas para exibir
  const gerarNumerosPaginas = () => {
    const paginas: (number | string)[] = [];
    const maxPaginasVisiveis = 5;
    
    if (totalPaginas <= maxPaginasVisiveis) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para páginas com reticências
      const metade = Math.floor(maxPaginasVisiveis / 2);
      let inicio = Math.max(1, paginaAtual - metade);
      let fim = Math.min(totalPaginas, paginaAtual + metade);

      // Ajustar se estamos no início
      if (paginaAtual <= metade) {
        fim = maxPaginasVisiveis;
      }

      // Ajustar se estamos no final
      if (paginaAtual > totalPaginas - metade) {
        inicio = totalPaginas - maxPaginasVisiveis + 1;
      }

      // Adicionar primeira página e reticências se necessário
      if (inicio > 1) {
        paginas.push(1);
        if (inicio > 2) {
          paginas.push('...');
        }
      }

      // Adicionar páginas do meio
      for (let i = inicio; i <= fim; i++) {
        paginas.push(i);
      }

      // Adicionar reticências e última página se necessário
      if (fim < totalPaginas) {
        if (fim < totalPaginas - 1) {
          paginas.push('...');
        }
        paginas.push(totalPaginas);
      }
    }

    return paginas;
  };

  const numerosPaginas = gerarNumerosPaginas();

  if (totalItens === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      {/* Informações de itens */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Mostrando {primeiroItem} a {ultimoItem} de {totalItens} usuários
        </span>
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center space-x-2">
        {/* Seletor de itens por página */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select
            value={itensPorPagina.toString()}
            onValueChange={(value) => onItensPorPaginaChange(Number(value))}
            disabled={carregando}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navegação de páginas */}
        <div className="flex items-center space-x-1">
          {/* Primeira página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginaChange(1)}
            disabled={!temPaginaAnterior || carregando}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginaChange(paginaAtual - 1)}
            disabled={!temPaginaAnterior || carregando}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Números das páginas */}
          {numerosPaginas.map((pagina, index) => {
            if (pagina === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            const numeroPagina = pagina as number;
            const isAtual = numeroPagina === paginaAtual;

            return (
              <Button
                key={numeroPagina}
                variant={isAtual ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPaginaChange(numeroPagina)}
                disabled={carregando}
                className="h-8 w-8 p-0"
              >
                {numeroPagina}
              </Button>
            );
          })}

          {/* Próxima página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginaChange(paginaAtual + 1)}
            disabled={!temProximaPagina || carregando}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginaChange(totalPaginas)}
            disabled={!temProximaPagina || carregando}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Informações de página (mobile) */}
      <div className="sm:hidden text-sm text-muted-foreground">
        Página {paginaAtual} de {totalPaginas}
      </div>
    </div>
  );
}