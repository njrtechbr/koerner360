import '@testing-library/jest-dom';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock do NextAuth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: {
        user: {
          id: '1',
          email: 'test@empresa.com',
          name: 'Test User',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    };
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock do Prisma
const mockPrisma = {
  usuario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  atendente: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  avaliacao: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  feedback: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  changelog: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
  $queryRaw: jest.fn(),
};

jest.mock('./src/lib/prisma.ts', () => ({
  prisma: mockPrisma,
  disconnectPrisma: jest.fn(),
  verificarConexao: jest.fn(),
}));

// Mock de variáveis de ambiente
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do ResizeObserver (necessário para alguns componentes UI)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock do window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock do console para testes mais limpos
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Configurações globais para testes
beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  jest.clearAllMocks();
  
  // Resetar localStorage e sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Configurações de timeout para testes assíncronos
jest.setTimeout(10000);

// Mock de componentes que podem causar problemas em testes
jest.mock('./src/components/ui/toaster.tsx', () => ({
  Toaster: () => null,
}));

jest.mock('./src/hooks/use-toast.ts', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  }),
  toast: jest.fn(),
}));

// Mock do Recharts (para gráficos)
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: () => null,
  Bar: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
}));

// Mock do Lucide React (ícones)
jest.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }) => (
    <div className={className} data-testid="mock-icon" {...props} />
  );
  
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return MockIcon;
      }
      return target[prop];
    },
  });
});

// Configurações para testes de upload de arquivo
Object.defineProperty(window, 'File', {
  value: class File {
    constructor(fileBits, fileName, options) {
      this.name = fileName;
      this.size = fileBits.length;
      this.type = options?.type || '';
      this.lastModified = Date.now();
    }
  },
});

Object.defineProperty(window, 'FileReader', {
  value: class FileReader {
    constructor() {
      this.readyState = 0;
      this.result = null;
      this.error = null;
    }
    
    readAsDataURL(file) {
      this.readyState = 2;
      this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
      setTimeout(() => this.onload?.(), 0);
    }
    
    abort() {
      this.readyState = 2;
    }
  },
});