describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('displays validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('allows user to login with valid credentials', () => {
    // Note: The backend needs to be running and seeded with these credentials
    cy.get('input[name="email"]').type('superadmin@erp.com');
    cy.get('input[name="password"]').type('admin123');
    
    // Intercept API call to mock response if backend is not running, 
    // but typically E2E hits real backend.
    
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.contains('Analytics Overview').should('be.visible');
  });
});
