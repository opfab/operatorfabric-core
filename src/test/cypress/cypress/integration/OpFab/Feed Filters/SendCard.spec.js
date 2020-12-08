//test to be done first befor moving to the two others
 let user='operator1'
 let password='test'

describe ('filter by severity',()=>{
  it('Check severity filters',()=>{

  cy.LogOpFab(user, password)           
  cy.wait(1200)


// Look only Alarm cards
cy.goToFeedSeverityFilter()
cy.get('#type-action').uncheck()
cy.wait(800)
cy.get('#type-compliant').uncheck()
cy.wait(800)
cy.get('#type-information').uncheck()
cy.wait(800)
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(238, 0, 0)');
cy.get(':nth-child(2) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(238, 0, 0)');
cy.get(':nth-child(3) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(238, 0, 0)');
//Look only Action cards
cy.get('#type-action').check()
cy.wait(1200)
cy.get('#type-alarm').uncheck()
cy.wait(1200)
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(253, 147, 18)');
cy.get(':nth-child(2) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(253, 147, 18)');
cy.get(':nth-child(3) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(253, 147, 18)');
//Look only Compliant cards

cy.get('#type-action').uncheck()
cy.wait(1200)
cy.get('#type-compliant').check()
cy.wait(1200)
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(0, 187, 0)');
cy.get(':nth-child(2) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(0, 187, 0)');
cy.get(':nth-child(3) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(0, 187, 0)');


//Look Only information cards
cy.get('#type-compliant').uncheck()
cy.wait(1200)
cy.get('#type-information').check()
cy.wait(1200)
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(16, 116, 172)');
cy.get(':nth-child(2) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(16, 116, 172)');
cy.get(':nth-child(3) > .col-12 > of-card > .card > .card-header > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color','rgb(16, 116, 172)');

cy.wait(1200)

})
})