describe ('User management tests',()=>{
     let login= 'admin'
     let pswrd='test'
     let color='rgba(0, 0, 0, 0)'
    it('login and go to admin page', ()=>{
      
     cy.LogOpFab(login, pswrd)
     cy.wait(500)
     cy.goToAdmin()
    })
    it('check labels',()=>{
        cy.get('#addUser').should('be.visible')

        cy.get(':nth-child(2) > label').should('be.visible')
        cy.get(':nth-child(2) > label').contains('Add new user')

        cy.get('.col-md-4 > .form-control').should('be.visible')
        //cy.get('.col-md-4 > .form-control').contains('filter all columns')
        cy.get('thead > tr > :nth-child(1)').contains('Login')
        cy.get('thead > tr > :nth-child(1)').should('be.visible')
        cy.get('thead > tr > :nth-child(1)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(2)').contains('First name')
        cy.get('thead > tr > :nth-child(2)').should('be.visible')
        cy.get('thead > tr > :nth-child(2)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(3)').contains('Last name')
        cy.get('thead > tr > :nth-child(3)').should('be.visible')
        cy.get('thead > tr > :nth-child(3)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(4)').contains('Groups')
        cy.get('thead > tr > :nth-child(4)').should('be.visible')
        cy.get('thead > tr > :nth-child(4)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(5)').contains('Entities')
        cy.get('thead > tr > :nth-child(5)').should('be.visible')
        cy.get('thead > tr > :nth-child(5)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(6)').contains('Edit')
        cy.get('thead > tr > :nth-child(6)').should('be.visible')
        cy.get('thead > tr > :nth-child(6)').should('have.css','background-color',color)

        cy.get('thead > tr > :nth-child(7)').contains('Delete')
        cy.get('thead > tr > :nth-child(7)').should('be.visible')
        cy.get('thead > tr > :nth-child(7)').should('have.css','background-color',color)
        cy.get('thead > tr > :nth-child(7)').should('have.css','background-color',color)
        

        cy.get('.pagination-first').should('be.visible')
       // cy.get('.pagination-first').contains('First') wait bug correction
        
        cy.get('.pagination-prev').contains('Previous')
        cy.get('.pagination-prev').should('be.visible')

        cy.get('.pagination-next > .page-link').contains('Next')
        cy.get('.pagination-next > .page-link').should('be.visible')

        cy.get('.pagination-last > .page-link').contains('Last')
        cy.get('.pagination-last > .page-link').should('be.visible')

        cy.get('.active > .page-link').contains('1')
        cy.get('.active > .page-link').should('be.visible')

    }) 
    it('check result displayed for existing users',()=>{
   //Check data displyaed      
    cy.get('tbody > :nth-child(2) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('admin')
    cy.get('tbody > :nth-child(2) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('ADMIN')
    cy.get('tbody > :nth-child(2) > :nth-child(5)').contains('ENTITY1,ENTITY2')
    cy.get(':nth-child(2) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(2) > :nth-child(7) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains('operator3')
    cy.get('tbody > :nth-child(3) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(3) > :nth-child(4)').contains('ReadOnly,RTE,ADMIN,Dispatcher')
    cy.get('tbody > :nth-child(3) > :nth-child(5)').contains('ENTITY1')
    cy.get(':nth-child(3) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(3) > :nth-child(7) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(4) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(4) > :nth-child(1)').contains('operator1-admin')
    cy.get('tbody > :nth-child(4) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(4) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(4) > :nth-child(4)').contains('ReadOnly,ADMIN,Dispatcher')
    cy.get('tbody > :nth-child(4) > :nth-child(5)').contains('ENTITY1')
    cy.get(':nth-child(4) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(4) > :nth-child(7) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(5) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(5) > :nth-child(1)').contains('operator1')
    cy.get('tbody > :nth-child(5) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(5) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(5) > :nth-child(4)').contains('ReadOnly,Dispatcher')
    cy.get('tbody > :nth-child(5) > :nth-child(5)').contains('ENTITY1')
    cy.get(':nth-child(5) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(5) > :nth-child(7) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(6) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(6) > :nth-child(1)').contains('operator2')
    cy.get('tbody > :nth-child(6) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(6) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(6) > :nth-child(4)').contains('ReadOnly,Planner')
    cy.get('tbody > :nth-child(6) > :nth-child(5)').contains('ENTITY2')
    cy.get(':nth-child(6) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(6) > :nth-child(7) > .btn').should('be.visible')

    cy.get('of-users-table > .ng-dirty > .pagination > :nth-child(4) > .page-link').click() 

    cy.get('tbody > :nth-child(2) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('operator4')
    cy.get('tbody > :nth-child(2) > :nth-child(2)').should('be.empty')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').should('be.empty')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('Supervisor')
    cy.get('tbody > :nth-child(2) > :nth-child(5)').contains('ENTITY4')
    cy.get(':nth-child(2) > :nth-child(6) > .btn').should('be.visible')
    cy.get(':nth-child(2) > :nth-child(7) > .btn').should('be.visible')
}) 
it('create a new user ',()=>{
// This test doesn't work yet because the button (Add new user) remains desactiveted and 
    cy.get('#addUser').click()
    cy.get('.modal-title').should('be.visible')
    cy.get('.modal-title').contains('Add new user')


    cy.get(':nth-child(4) > mat-label').should('be.visible')
    cy.get(':nth-child(4) > mat-label').contains('Groups')
    cy.get(':nth-child(5) > mat-label').should('be.visible')
    cy.get(':nth-child(5) > mat-label').contains('Entities')

    cy.get('.btn-secondary').should('be.visible')
    cy.get('.btn-secondary').contains('Close')
    cy.get('.modal-footer > .btn-primary').should('be.visible')
    cy.get('.modal-footer > .btn-primary').contains('Add new user')

    cy.get('#groups > .mat-select-trigger > .mat-select-arrow-wrapper').click()
  
        
}) 
}) 