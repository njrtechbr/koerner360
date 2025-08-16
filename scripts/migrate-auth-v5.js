const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para substituir getServerSession por auth() em um arquivo
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Substituir import
    if (content.includes("import { getServerSession } from 'next-auth'")) {
      content = content.replace(
        /import { getServerSession } from 'next-auth'/g,
        "import { auth } from '@/auth'"
      );
      modified = true;
    }

    // Remover import do authOptions se existir
    if (content.includes("import { authOptions } from '@/auth'")) {
      content = content.replace(
        /import { authOptions } from '@\/auth';?\n?/g,
        ''
      );
      modified = true;
    }

    // Substituir chamadas getServerSession
    if (content.includes('getServerSession(authOptions)')) {
      content = content.replace(
        /getServerSession\(authOptions\)/g,
        'auth()'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrado: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erro ao migrar ${filePath}:`, error.message);
    return false;
  }
}

// Lista de arquivos para migrar
const filesToMigrate = [
  'src/app/api/changelog/route.ts',
  'src/app/api/changelog/[id]/route.ts',
  'src/app/api/changelog/[id]/itens/route.ts',
  'src/app/api/usuarios/[id]/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/atendentes/route.ts',
  'src/app/api/atendentes/[id]/route.ts',
  'src/app/atendentes/page.tsx',
  'src/app/atendentes/[id]/page.tsx',
  'src/app/atendentes/novo/page.tsx'
];

console.log('🚀 Iniciando migração para Auth.js v5...');

let migratedCount = 0;
let totalFiles = filesToMigrate.length;

filesToMigrate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (fs.existsSync(fullPath)) {
    if (migrateFile(fullPath)) {
      migratedCount++;
    }
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
  }
});

console.log(`\n✨ Migração concluída!`);
console.log(`📊 Arquivos migrados: ${migratedCount}/${totalFiles}`);
console.log('\n🔧 Próximos passos:');
console.log('1. Verificar se há erros de compilação');
console.log('2. Testar a autenticação');
console.log('3. Remover o arquivo src/auth.ts antigo se tudo estiver funcionando');