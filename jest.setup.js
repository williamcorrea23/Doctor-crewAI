import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills para Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock do Firebase
jest.mock('./lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn()
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }
}));

// Mock do Next.js Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}));

// Mock do Next.js Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock das APIs externas
jest.mock('./lib/circuit-breaker', () => ({
  CircuitBreaker: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ success: true }),
    getStats: jest.fn().mockReturnValue({
      state: 'CLOSED',
      failures: 0,
      successes: 10
    })
  })),
  circuitBreakers: {
    openai: {
      execute: jest.fn().mockResolvedValue({ success: true })
    },
    groq: {
      execute: jest.fn().mockResolvedValue({ success: true })
    }
  }
}));

// Mock do sistema de cache
jest.mock('./lib/cache-manager', () => ({
  AdvancedCache: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(true),
    clear: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockReturnValue({
      hits: 0,
      misses: 0,
      hitRate: 0
    })
  })),
  cacheInstances: {
    apiResponses: {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      getOrSet: jest.fn().mockImplementation((key, fn) => fn())
    },
    userData: {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined)
    }
  }
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock do fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers()
  })
);

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

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

// Configurações globais de teste
beforeEach(() => {
  // Limpa todos os mocks antes de cada teste
  jest.clearAllMocks();
  
  // Reseta o localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reseta o fetch mock
  global.fetch.mockClear();
});

// Timeout para testes assíncronos
jest.setTimeout(10000);