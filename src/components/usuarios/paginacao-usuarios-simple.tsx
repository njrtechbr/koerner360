'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacaoUsuarios {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  temProximaPagina: boolean;
  temPaginaAnterior: boolean;
}

interface PaginacaoUsuariosProps {
  paginacao: PaginacaoUsuarios;
  onPaginaChange: (pagina: number) => void;
  onItensPorPaginaChange: (itens: number) => void;
}

export function PaginacaoUsuarios({
  paginacao,
  onPaginaChange,
  onItensPorPaginaChange
}: PaginacaoUsuariosProps) {
  const { paginaAtual, totalPaginas, totalItens, itensPorPagina, temProximaPagina, temPaginaAnterior } = paginacao;

  const inicioItem = (paginaAtual - 1) * itensPorPagina + 1;
  const fimItem = Math.min(paginaAtual * itensPorPagina, totalItens);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {inicioItem} a {fimItem} de {totalItens} usuários
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Itens por página:</span>
          <Select
            value={itensPorPagina.toString()}
            onValueChange={(value) => onItensPorPaginaChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginaChange(paginaAtual - 1)}
          disabled={!temPaginaAnterior}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            let pageNum;
            if (totalPaginas <= 5) {
              pageNum = i + 1;
            } else if (paginaAtual <= 3) {
              pageNum = i + 1;
            } else if (paginaAtual >= totalPaginas - 2) {
              pageNum = totalPaginas - 4 + i;
            } else {
              pageNum = paginaAtual - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === paginaAtual ? "default" : "outline"}
                size="sm"
                onClick={() => onPaginaChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginaChange(paginaAtual + 1)}
          disabled={!temProximaPagina}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}