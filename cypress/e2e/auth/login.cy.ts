describe('Login Flow', () => {
  beforeEach(() => {
    // Visita a página de login
    cy.visit('/login');
    
    // Limpa dados de autenticação
    cy.clearLocalStorage();
    cy.clearCookies();
  });
  
  it('should display login form correctly', () => {
    // Verifica elementos da página
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain.text', 'Entrar');
    cy.get('[data-testid="google-signin-btn"]').should('be.visible');
    
    // Verifica links
    cy.get('a[href="/register"]').should('contain.text', 'Criar conta');
    cy.get('a[href="/forgot-password"]').should('contain.text', 'Esqueceu a senha');
  });
  
  it('should show validation errors for empty fields', () => {
    // Tenta submeter formulário vazio
    cy.get('button[type="submit"]').click();
    
    // Verifica mensagens de erro
    cy.get('[data-testid="email-error"]').should('contain.text', 'Email é obrigatório');
    cy.get('[data-testid="password-error"]').should('contain.text', 'Senha é obrigatória');
  });
  
  it('should validate email format', () => {
    // Insere email inválido
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verifica erro de formato
    cy.get('[data-testid="email-error"]').should('contain.text', 'Email inválido');
  });
  
  it('should validate password length', () => {
    // Insere senha muito curta
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('123');
    cy.get('button[type="submit"]').click();
    
    // Verifica erro de tamanho
    cy.get('[data-testid="password-error"]').should('contain.text', 'Senha deve ter pelo menos 6 caracteres');
  });
  
  it('should handle invalid credentials', () => {
    // Insere credenciais inválidas
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verifica mensagem de erro
    cy.get('[data-testid="login-error"]')
      .should('be.visible')
      .and('contain.text', 'Credenciais inválidas');
  });
  
  it('should successfully login with valid credentials', () => {
    // Intercepta chamada de API
    cy.intercept('POST', '/api/auth/signin', {
      statusCode: 200,
      body: {
        user: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User'
        },
        token: 'mock-jwt-token'
      }
    }).as('loginRequest');
    
    // Preenche formulário
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
    
    // Submete formulário
    cy.get('button[type="submit"]').click();
    
    // Verifica loading state
    cy.get('button[type="submit"]').should('contain.text', 'Entrando...');
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Aguarda requisição
    cy.wait('@loginRequest');
    
    // Verifica redirecionamento
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verifica se usuário está logado
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
  
  it('should handle Google sign in', () => {
    // Mock do Google OAuth
    cy.window().then((win) => {
      cy.stub(win, 'open').as('googlePopup');
    });
    
    // Clica no botão do Google
    cy.get('[data-testid="google-signin-btn"]').click();
    
    // Verifica se popup foi aberto
    cy.get('@googlePopup').should('have.been.called');
  });
  
  it('should navigate to register page', () => {
    // Clica no link de registro
    cy.get('a[href="/register"]').click();
    
    // Verifica redirecionamento
    cy.url().should('include', '/register');
    cy.get('[data-testid="register-form"]').should('be.visible');
  });
  
  it('should navigate to forgot password page', () => {
    // Clica no link de esqueceu senha
    cy.get('a[href="/forgot-password"]').click();
    
    // Verifica redirecionamento
    cy.url().should('include', '/forgot-password');
    cy.get('[data-testid="forgot-password-form"]').should('be.visible');
  });
  
  it('should show/hide password', () => {
    const password = 'mypassword123';
    
    // Digita senha
    cy.get('input[type="password"]').type(password);
    
    // Verifica que está oculta
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
    
    // Clica para mostrar
    cy.get('[data-testid="toggle-password"]').click();
    
    // Verifica que está visível
    cy.get('input[type="text"]').should('have.value', password);
    
    // Clica para ocultar novamente
    cy.get('[data-testid="toggle-password"]').click();
    
    // Verifica que está oculta
    cy.get('input[type="password"]').should('have.value', password);
  });
  
  it('should clear error message when user starts typing', () => {
    // Gera erro primeiro
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verifica erro
    cy.get('[data-testid="login-error"]').should('be.visible');
    
    // Começa a digitar novamente
    cy.get('input[type="email"]').clear().type('test@example.com');
    
    // Verifica que erro foi limpo
    cy.get('[data-testid="login-error"]').should('not.exist');
  });
  
  it('should handle keyboard navigation', () => {
    // Tab navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'type', 'email');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'type', 'password');
    
    cy.focused().tab();
    cy.focused().should('contain.text', 'Entrar');
    
    // Enter para submeter
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123{enter}');
    
    // Verifica que formulário foi submetido
    cy.get('button[type="submit"]').should('contain.text', 'Entrando...');
  });
  
  it('should be responsive on mobile', () => {
    // Testa em viewport mobile
    cy.viewport('iphone-x');
    
    // Verifica layout mobile
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    
    // Verifica que elementos não estão sobrepostos
    cy.get('input[type="email"]').should('not.have.css', 'position', 'absolute');
  });
  
  it('should persist login state after page refresh', () => {
    // Mock de login bem-sucedido
    cy.intercept('POST', '/api/auth/signin', {
      statusCode: 200,
      body: {
        user: { uid: 'test-user-id', email: 'test@example.com' },
        token: 'mock-jwt-token'
      }
    });
    
    // Faz login
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    
    // Aguarda redirecionamento
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Recarrega página
    cy.reload();
    
    // Verifica que usuário ainda está logado
    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});