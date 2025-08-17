import fs from 'fs';
import path from 'path';
import { logError } from '@/lib/error-utils';

export interface ChangelogEntry {
  version: string;
  date: string;
  title?: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
    security?: string[];
    melhorado?: string[];
    corrigido?: string[];
    adicionado?: string[];
    atualizado?: string[];
    removido?: string[];
    testado?: string[];
    identificado?: string[];
    tecnico?: string[];
  };
  description?: string;
  details?: string[];
}

export function parseChangelog(): ChangelogEntry[] {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf-8');
    
    const entries: ChangelogEntry[] = [];
    const lines = content.split('\n');
    
    let currentEntry: ChangelogEntry | null = null;
    let currentSection: string | null = null;
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      // Detectar blocos de código
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      // Pular linhas dentro de blocos de código
      if (inCodeBlock) {
        continue;
      }
      
      // Detectar versão (## [versão] - data)
      const versionMatch = line.match(/^##\s*\[([^\]]+)\]\s*-\s*(.+)$/);
      if (versionMatch) {
        // Salvar entrada anterior se existir
        if (currentEntry) {
          entries.push(currentEntry);
        }
        
        currentEntry = {
          version: versionMatch[1] || 'Unknown',
          date: versionMatch[2] || 'Unknown',
          changes: {}
        };
        currentSection = null;
        continue;
      }
      
      // Detectar seções (### Tipo)
      const sectionMatch = line.match(/^###\s*(.+)$/);
      if (sectionMatch && currentEntry) {
        const sectionTitle = (sectionMatch[1] || '').toLowerCase();
        
        // Mapear títulos em português para chaves em inglês
        const sectionMap: { [key: string]: string } = {
          'adicionado': 'added',
          'alterado': 'changed',
          'corrigido': 'fixed',
          'removido': 'removed',
          'segurança': 'security',
          'melhorado': 'melhorado',
          'atualizado': 'atualizado',
          'testado': 'testado',
          'identificado': 'identificado',
          'técnico': 'tecnico',
          '🔧 correções de layout': 'fixed',
          '✨ adicionado': 'added',
          '🔄 alterado': 'changed',
          '🗑️ removido': 'removed',
          '🐛 corrigido': 'fixed',
          '✅ testado': 'testado',
          '🔧 melhorado': 'melhorado',
          '🔧 configuração': 'changed',
          '🚀 automação': 'added',
          '📚 documentação': 'added',
          '🛠️ aspectos técnicos': 'tecnico'
        };
        
        currentSection = sectionMap[sectionTitle] || sectionTitle;
        continue;
      }
      
      // Detectar itens de lista (- item)
      const listMatch = line.match(/^-\s*(.+)$/);
      if (listMatch && listMatch[1] && currentEntry && currentSection) {
        const item = listMatch[1];
        
        // Inicializar array se não existir
        if (!currentEntry.changes[currentSection as keyof typeof currentEntry.changes]) {
          (currentEntry.changes as Record<string, string[]>)[currentSection] = [];
        }
        
        // Adicionar item ao array
        if (currentEntry && currentSection) {
          const changes = currentEntry.changes as Record<string, string[]>;
          changes[currentSection]?.push(item);
        }
        continue;
      }
      
      // Detectar descrições ou detalhes adicionais
      if (line && !line.startsWith('#') && !line.startsWith('-') && currentEntry && !currentSection) {
        if (!currentEntry.description) {
          currentEntry.description = line;
        } else {
          if (!currentEntry.details) {
            currentEntry.details = [];
          }
          currentEntry.details.push(line);
        }
      }
    }
    
    // Adicionar última entrada
    if (currentEntry) {
      entries.push(currentEntry);
    }
    
    return entries.filter(entry => entry.version !== 'Não Lançado');
  } catch (error) {
    logError('Erro ao ler CHANGELOG.md', error);
    return [];
  }
}

export function getChangelogData(): ChangelogEntry[] {
  return parseChangelog();
}