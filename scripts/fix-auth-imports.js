const fs = require('fs');
const path = require('path');

// Função para calcular o caminho relativo correto para auth.ts
function getRelativeAuthPath(filePath) {
  const relativePath = path.relative(path.dirname(filePath), 'auth.ts');
  return relativePath.replace(/\\/g, '/');
}

// Função para corrigir importações em um arquivo
function fixAuthImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Calcular o caminho relativo correto
    const correctPath = getRelativeAuthPath(filePath);
    
    // Substituir import de '@/auth'
    if (content.includes("import { auth } from '@/auth'")) {
      content = content.replace(
        /import { auth } from '@\/auth'/g,
        `import { auth } from '${correctPath}'`
      );
      modified = true;
    }

    // Substituir import de handlers
    if (content.includes("import { handlers } from '@/auth'")) {
      content = content.replace(
        /import { handlers } from '@\/auth'/g,
        `import { handlers } from '${correctPath}'`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath} -> ${correctPath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
    return false;
  }
}

// Lista de arquivos para corrigir
const filesToFix = [
  'src/app/api/changelog/route.ts',
  'src/app/api/changelog/[id]/route.ts',
  'src/app/api/changelog/[id]/itens/route.ts',
  'src/app/api/usuarios/route.ts',
  'src/app/api/usuarios/[id]/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/atendentes/route.ts',
  'src/app/api/atendentes/[id]/route.ts',
  'src/app/atendentes/page.tsx',
  'src/app/atendentes/[id]/page.tsx',
  'src/app/atendentes/novo/page.tsx'
];

console.log('🔧 Corrigindo importações do auth.ts...');

let fixedCount = 0;
let totalFiles = filesToFix.length;

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (fs.existsSync(fullPath)) {
    if (fixAuthImports(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
  }
});

console.log(`\n✨ Correção concluída!`);
console.log(`📊 Arquivos corrigidos: ${fixedCount}/${totalFiles}`);