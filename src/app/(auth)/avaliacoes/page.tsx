import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avaliações | Koerner 360',
  description: 'Gestão de avaliações do sistema Koerner 360'
}

export default function AvaliacoesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Módulo de Avaliações</h2>
          <p className="text-muted-foreground mb-4">
            Esta página está em desenvolvimento. Em breve você poderá gerenciar todas as avaliações do sistema.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Funcionalidades planejadas:</p>
            <ul className="mt-2 space-y-1">
              <li>• Visualizar avaliações de atendentes</li>
              <li>• Filtrar por período e critérios</li>
              <li>• Gerar relatórios de performance</li>
              <li>• Acompanhar métricas de qualidade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}