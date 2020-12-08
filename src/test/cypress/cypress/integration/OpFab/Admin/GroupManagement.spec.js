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
        cy.get('.nav > :nth-child(3) > .nav-link').click()
        cy.get('.nav > :nth-child(3) > .nav-link').should('be.visible')
        cy.get('.nav > :nth-child(3) > .nav-link').contains('Groups management')

        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(1)').should('be.visible')
        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(1)').contains('Id')

        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(2)').should('be.visible')
        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(2)').contains('Name')

        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(3)').should('be.visible')
        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(3)').contains('Description')

        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(4)').should('be.visible')
        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(4)').contains('Edit')

        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(5)').should('be.visible')
        cy.get('of-groups-table > ng-table > .table > thead > tr > :nth-child(5)').contains('Delete')
        

        cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-first').should('be.visible')
       // cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-first').contains('First') wait bug correction
        


       cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-prev').contains('Previous')
       cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-prev').should('be.visible')

        cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-next > .page-link').contains('Next')
        cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-next > .page-link').should('be.visible')
   
        cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-last > .page-link').contains('Last')
        cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-last > .page-link').should('be.visible')

        cy.get('of-groups-table > .ng-dirty > .pagination > .active > .page-link').contains('1').should('be.visible')
        cy.get('of-groups-table > .ng-dirty > .pagination > :nth-child(4) > .page-link').contains('2').should('be.visible')
    
    }) 
    it('check result displayed for existing groups',()=>{
   //Check data displyaed      
    cy.get('tbody > :nth-child(2) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('ADMIN')
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('ADMINISTRATORS')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('The admin group')
    cy.get(':nth-child(2) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(2) > :nth-child(5) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains('RTE')
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('RTE France')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('RTE TSO Group')
    cy.get(':nth-child(3) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(3) > :nth-child(5) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(4) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(4) > :nth-child(1)').contains('Dispatcher')
    cy.get('tbody > :nth-child(4) > :nth-child(2)').contains('Dispatcher')
    cy.get('tbody > :nth-child(4) > :nth-child(3)').contains('Dispatcher Group')
    cy.get(':nth-child(4) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(4) > :nth-child(5) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(5) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(5) > :nth-child(1)').contains('Planner')
    cy.get('tbody > :nth-child(5) > :nth-child(2)').contains('Planner')
    cy.get('tbody > :nth-child(5) > :nth-child(3)').contains('Planner Group')
    cy.get(':nth-child(5) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(5) > :nth-child(5) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(6) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(6) > :nth-child(1)').contains('Supervisor')
    cy.get('tbody > :nth-child(6) > :nth-child(2)').contains('Supervisor')
    cy.get('tbody > :nth-child(6) > :nth-child(3)').contains('Supervisor Group')
    cy.get(':nth-child(6) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(6) > :nth-child(5) > .btn').should('be.visible')

    cy.get('of-groups-table > .ng-dirty > .pagination > .pagination-next > .page-link').click() 

    cy.get('tbody > :nth-child(2) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains('Manager')
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('Manager')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('Manager Group')
    cy.get(':nth-child(2) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(2) > :nth-child(5) > .btn').should('be.visible')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').should('be.visible')
    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains('ReadOnly')
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('ReadOnly')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('ReadOnly Group')
    cy.get(':nth-child(3) > :nth-child(4) > .btn').should('be.visible')
    cy.get(':nth-child(3) > :nth-child(5) > .btn').should('be.visible')
}) 
it('create a new user ',()=>{
// This test doesn't work yet because the button (Add new user) remains desactiveted and 
    cy.get('of-groups-table > .row > :nth-child(2) > #addUser > .fas').click()
    cy.get('.modal-title').should('be.visible')
    cy.get('.modal-title').contains('Add new group')


    cy.get(':nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Id')
    cy.get(':nth-child(2) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Name')
    cy.get(':nth-child(3) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').should('be.visible').contains('Description')
 
 
    cy.get(':nth-child(1) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').type('cypress')
    cy.get(':nth-child(2) > .mat-form-field > .mat-form-field-wrapper > .mat-form-field-flex > .mat-form-field-infix').type('test-group')
    cy.get('#description').type('cypress test groups')

    cy.get('.btn-secondary').should('be.visible')
    cy.get('.btn-secondary').contains('Close')
    cy.get('.modal-footer > .btn-primary').should('be.visible')
    cy.get('.modal-footer > .btn-primary').contains('Add new group')
  
        
}) 
}) 