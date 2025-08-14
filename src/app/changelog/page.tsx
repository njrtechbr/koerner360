'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  Tag, 
  Calendar, 
  User, 
  Hash, 
  Clock,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { buildInfo } from '@/lib/build-info';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
    security?: string[];
  };
}

// Dados do changelog (em produção, isso viria de um arquivo ou API)
const changelogData: ChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2025-08-14',
    changes: {
      added: [
        'Sistema de versionamento automático',
        'Scripts de build e deploy',
        'Configuração de Prettier e ESLint',
        'Hooks do Git com Husky',
        'Pipeline CI/CD com GitHub Actions',
        'Workflow de release automático',
        'Página de changelog',
        'Documentação do banco de dados'
      ],
      changed: [
        'Configuração do TypeScript aprimorada',
        'Estrutura de projeto otimizada'
      ]
    }
  }
];

const typeColors = {
  added: 'bg-green-100 text-green-800 border-green-200',
  changed: 'bg-blue-100 text-blue-800 border-blue-200',
  fixed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  removed: 'bg-red-100 text-red-800 border-red-200',
  security: 'bg-purple-100 text-purple-800 border-purple-200'
};

const typeLabels = {
  added: 'Adicionado',
  changed: 'Alterado',
  fixed: 'Corrigido',
  removed: 'Removido',
  security: 'Segurança'
};

export default function ChangelogPage() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['0.1.0']));
  const [buildInfoData, setBuildInfoData] = useState(buildInfo);

  useEffect(() => {
    // Atualizar informações de build se necessário
    setBuildInfoData(buildInfo);
  }, []);

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">
          Histórico de versões e mudanças do Koerner 360
        </p>
      </div>

      {/* Informações da Build Atual */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Informações da Build Atual
          </CardTitle>
          <CardDescription>
            Detalhes da versão atualmente em execução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Versão:</span>
                <Badge variant="outline">{buildInfoData.version}</Badge>
                {buildInfoData.git.hasUncommittedChanges && (
                  <Badge variant="destructive">Modificado</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Branch:</span>
                <Badge variant="secondary">{buildInfoData.git.branch}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Commit:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {buildInfoData.git.commitShort}
                </code>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Autor:</span>
                <span className="text-sm">{buildInfoData.git.commitAuthor}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data do Build:</span>
                <span className="text-sm">
                  {new Date(buildInfoData.build.date).toLocaleString('pt-BR')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Ambiente:</span>
                <Badge 
                  variant={buildInfoData.build.environment === 'production' ? 'default' : 'secondary'}
                >
                  {buildInfoData.build.environment}
                </Badge>
              </div>
            </div>
          </div>
          
          {buildInfoData.git.commitMessage && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Mensagem do Commit:</p>
              <p className="text-sm text-muted-foreground">
                {buildInfoData.git.commitMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Versões */}
      <div className="space-y-4">
        {changelogData.map((entry, index) => {
          const isExpanded = expandedVersions.has(entry.version);
          const isLatest = index === 0;
          
          return (
            <Card key={entry.version} className={isLatest ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      v{entry.version}
                      {isLatest && (
                        <Badge className="ml-2">Atual</Badge>
                      )}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersion(entry.version)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(entry.changes).map(([type, items]) => {
                      if (!items || items.length === 0) return null;
                      
                      return (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={typeColors[type as keyof typeof typeColors]}
                            >
                              {typeLabels[type as keyof typeof typeLabels]}
                            </Badge>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {items.map((item, itemIndex) => (
                              <li key={itemIndex} className="text-sm text-muted-foreground">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Rodapé */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Para mais informações sobre as mudanças, consulte o{' '}
          <Button variant="link" className="p-0 h-auto" asChild>
            <a 
              href="https://github.com/seu-usuario/koerner360/blob/main/CHANGELOG.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              CHANGELOG.md completo
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </p>
      </div>
    </div>
  );
}