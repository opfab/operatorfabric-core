//Apply a time filter and check results
let user='operator1'
let password='test'
describe ('Filter and check results',()=>{
 
  it('Apply time filter',()=>{
   
  var startDate = Cypress.moment().add(-1, 'month').startOf('month').format('YYYY-MM-DD')
  var endDate = Cypress.moment().add(1, 'month').endOf('month').format('YYYY-MM-DD')
   
     cy.LogOpFab(user, password);
     cy.get('of-read-sort > .ng-star-inserted > .btn > .ng-fa-icon > .svg-inline--fa > path').click()
     cy.get('of-time-filter > .btn-outline-light').click()
     cy.get('#startDateInput').type(startDate,{ force: true })
     cy.wait(600)
     cy.get('#startTimeInput').clear()
     cy.get('#startTimeInput').type('00')
     cy.wait(600)
     cy.get('#endDateInput').type(endDate,{ force: true })
     cy.wait(600)
     cy.get('#endTimeInput').clear()
     cy.get('#endTimeInput').type('00')
     cy.get('#confirm_button').click()
     cy.wait(600)
   
     cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(16, 116, 172)');
   
     cy.get(':nth-child(2) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(0, 187, 0)');
   
     cy.get(':nth-child(3) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(253, 147, 18)');
   
     cy.get(':nth-child(4) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(238, 0, 0)');
   
     cy.get(':nth-child(5) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(0, 187, 0)');
     cy.get('.calc-height-feed-content').scrollTo(0, 250)
   
     cy.get(':nth-child(6) > .col-12 > of-card > .card > .card-header > .badge-border')
     cy.should('be.visible');
     cy.should('have.css', 'background-color','rgb(253, 147, 18)');
   
          })
      })
  