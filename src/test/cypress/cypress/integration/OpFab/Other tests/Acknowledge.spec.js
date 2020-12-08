// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
let user="operator1"
let password="test"

describe ('ACK TEST',()=>{
   it('login and send a card', ()=>{
     
      cy.LogOpFab(user, password);
      cy.get('of-read-sort > .ng-star-inserted > .btn > .ng-fa-icon > .svg-inline--fa > path').click()
      let possibleSeverities= ['ALARM', 'ACTION', 'INFORMATION', 'COMPLIANT'];
      let severity = possibleSeverities[Math.floor(Math.random() * possibleSeverities.length)];
      let publisherName = "publisher_test"
      let processName= "defaultProcess"
      let publisherV = "1"
      let state = "messageState"
      cy.log(severity)
     
      let startDate = Cypress.moment().format('x')
      let startdatedisplayed = Cypress.moment().format('HH:mm DD/MM/YYYY')
 
      let startDateint = parseInt(startDate)
      let endDatedisplayed = (Cypress.moment().add(1, 'day').format('HH:mm DD/MM/YYYY'))
      const endDate = parseInt(Cypress.moment().add(1, 'day').format('x'))
      let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
      cy.log (dateDisplayed)
      cy.log (startDate)
      cy.log (endDate)
      cy.log (startdatedisplayed)
      cy.log (endDatedisplayed)
       
      let red = 'rgb(238, 0, 0)'
      let green = 'rgb(0, 187, 0)'
      let bleue = 'rgb(16, 116, 172)'
      let yellow = 'rgb(253, 147, 18)'
 
      var color ='color';
           
      cy.log(severity)
 
      switch(severity){
          case 'ALARM':
            color = red;
               break;
          case 'COMPLIANT':
            color = green;
               break;
          case 'INFORMATION':
            color = bleue;
               break;
          case 'ACTION':
             color = yellow;                 
            }
          
           
      cy.log(color)
      let processInstanceId = "Cy-" + startDate
      cy.log(processInstanceId)
      cy.PushCard(processName, publisherV, publisherName, processInstanceId, state, severity, startDateint, endDate);
      cy.wait(5000)
 
      cy.log(color) 
 
// Check card created
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > :nth-child(1) > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('h2').contains('Hello '+user+', you received the following message');
//cy.get('span[class="nav-link"]').eq(0).contains('Message');
cy.get('.nav > .nav-item > .nav-link')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
 
cy.log('[blue](card checked) ')
cy.wait(500)
 
//Acknowledge the card
 
cy.get('#div-detail-btn > .btn').contains("Acknowledge and close").click()
 
 
 
cy.get('of-ack-filter > .btn').click()
cy.get('#ack-ack').click()
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > :nth-child(1) > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('h2').contains('Hello '+user+', you received the following message');
cy.get('.nav > .nav-item > .nav-link')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
cy.get('#div-detail-btn > .btn').contains("Cancel acknowledgement").click()
 
cy.get('of-ack-filter > .btn').click()
cy.get('#ack-notack').click()
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > :nth-child(1) > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('h2').contains('Hello '+user+', you received the following message');
cy.get('.nav > .nav-item > .nav-link')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
 
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
 
        })
 
    })
