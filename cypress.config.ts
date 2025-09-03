import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL da aplicação
    baseUrl: 'http://localhost:3000',
    
    // Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Configurações de timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Configurações de retry
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Configurações de vídeo e screenshots
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    // Padrões de arquivos de teste
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Configurações de setup
    setupNodeEvents(on, config) {
      // Implementar plugins do Cypress aqui
      
      // Plugin para limpeza de dados de teste
      on('task', {
        clearDatabase() {
          // Implementar limpeza do banco de dados de teste
          return null;
        },
        
        seedDatabase() {
          // Implementar seed de dados de teste
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      // Configurações de ambiente
      config.env = {
        ...config.env,
        FIREBASE_PROJECT_ID: 'enem-test',
        TEST_USER_EMAIL: 'test@example.com',
        TEST_USER_PASSWORD: 'testpassword123'
      };
      
      return config;
    },
    
    // Configurações de experimentais
    experimentalStudio: true,
    experimentalWebKitSupport: true
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    },
    
    // Configurações para testes de componente
    viewportWidth: 1000,
    viewportHeight: 660,
    
    // Padrões de arquivos de teste de componente
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    
    // Configurações de setup para componentes
    setupNodeEvents(on, config) {
      // Plugins específicos para testes de componente
      return config;
    }
  },
  
  // Configurações globais
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  
  // Configurações de ambiente
  env: {
    coverage: false,
    codeCoverage: {
      exclude: [
        'cypress/**/*.*',
        '.next/**/*.*',
        'node_modules/**/*.*'
      ]
    }
  },
  
  // Configurações de relatórios
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json'
  }
});