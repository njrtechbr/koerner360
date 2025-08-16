const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho para sua aplicação Next.js para carregar next.config.js e arquivos .env
  dir: './',
});

// Configuração customizada do Jest
const customJestConfig = {
  // Adicionar mais opções de configuração antes de cada teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // Ignorar arquivos/diretórios
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Mapeamento de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  
  // Transformações
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/page.tsx',
  ],
  
  // Diretório de relatórios de cobertura
  coverageDirectory: 'coverage',
  
  // Relatórios de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Limites de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Configurações específicas para diferentes tipos de arquivo
  // projects: [
  //   {
  //     displayName: 'Components',
  //     testMatch: ['<rootDir>/__tests__/components/**/*.(test|spec).(js|jsx|ts|tsx)'],
  //     testEnvironment: 'jsdom',
  //   },
  //   {
  //     displayName: 'API',
  //     testMatch: ['<rootDir>/__tests__/api/**/*.(test|spec).(js|jsx|ts|tsx)'],
  //     testEnvironment: 'node',
  //   },
  //   {
  //     displayName: 'Utils/Lib',
  //     testMatch: ['<rootDir>/__tests__/lib/**/*.(test|spec).(js|jsx|ts|tsx)'],
  //     testEnvironment: 'node',
  //   },
  // ],
  
  // Configurações globais
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  // Verbose output
  verbose: true,
  
  // Configurações de timeout
  testTimeout: 10000,
  
  // Configurações de mock
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

// Criar e exportar configuração do Jest
module.exports = createJestConfig(customJestConfig);