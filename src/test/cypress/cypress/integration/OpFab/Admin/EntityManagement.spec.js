describe ('Enityt management tests',()=>{
    let login= 'admin'
    let pswrd='test'
    let color='rgba(0, 0, 0, 0)'
   it('login and go to admin page', ()=>{
     
    cy.LogOpFab(login, pswrd)
    cy.wait(500)
    cy.goToAdmin()
   })
   it('check labels',()=>{
        cy.get('.nav > :nth-child(2) > .nav-link').click()
        cy.get('.nav > :nth-child(2) > .nav-link').should('be.visible')
        cy.get('.nav > :nth-child(2) > .nav-link').contains('Entities management')

        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(1)').should('be.visible')
        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(1)').contains('Id')

        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(2)').should('be.visible')
        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(2)').contains('Name')

        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(3)').should('be.visible')
        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(3)').contains('Description')

        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(4)').should('be.visible')
        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(4)').contains('Edit')

        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(5)').should('be.visible')
        cy.get('of-entities-table > ng-table > .table > thead > tr > :nth-child(5)').contains('Delete')
     }) 

   it('check result displayed for existing entities',()=>{
  //Check data displyaed      
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(2) > :nth-child(1)').should('be.visible').contains('ENTITY1')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(2) > :nth-child(2)').should('be.visible').contains('Control Room 1')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(2) > :nth-child(3)').should('be.visible').contains('Control Room 1')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(2) > :nth-child(4) > .btn').should('be.visible')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(2) > :nth-child(5) > .btn').should('be.visible')

  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(3) > :nth-child(1)').should('be.visible').contains('ENTITY2')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(3) > :nth-child(2)').should('be.visible').contains('Control Room 2')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(3) > :nth-child(3)').should('be.visible').contains('Control Room 2')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(3) > :nth-child(4) > .btn').should('be.visible')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(3) > :nth-child(5) > .btn').should('be.visible')

  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(4) > :nth-child(1)').should('be.visible').contains('ENTITY3')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(4) > :nth-child(2)').should('be.visible').contains('Control Room 3')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(4) > :nth-child(3)').should('be.visible').contains('Control Room 3')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(4) > :nth-child(4) > .btn').should('be.visible')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(4) > :nth-child(5) > .btn').should('be.visible')

  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(5) > :nth-child(1)').should('be.visible').contains('ENTITY4')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(5) > :nth-child(2)').should('be.visible').contains('IT Supervision Center')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(5) > :nth-child(3)').should('be.visible').contains('IT Supervision Center')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(5) > :nth-child(4) > .btn').should('be.visible')
  cy.get('of-entities-table > ng-table > .table > tbody > :nth-child(5) > :nth-child(5) > .btn').should('be.visible')

}) 
it('create a new entity ',()=>{
// This test doesn't work yet because the button (Add new entity) remains desactiveted 
   cy.get('of-entities-table > .row > :nth-child(2) > #addUser').click()
   cy.get('.modal-title').should('be.visible')
   cy.get('.modal-title').contains('Add new entity')

   cy.get('.btn-secondary').should('be.visible')
   cy.get('.btn-secondary').contains('Close')
   cy.get('.modal-footer > .btn-primary').should('be.visible')
   cy.get('.modal-footer > .btn-primary').contains('Add new entity')

   cy.get(':nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Id')
   cy.get(':nth-child(2) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Name')
   cy.get(':nth-child(3) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Description')


   cy.get(':nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').type('cypress')
   cy.get(':nth-child(2) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').type('test-entity')
   cy.get('#description').type('cypress test entity')
       
}) 
}) 