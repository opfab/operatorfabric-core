// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('basicCheck',()=>{

  let possibleSeverities= ['ALARM', 'ACTION', 'INFORMATION', 'COMPLIANT'];
  let severity = possibleSeverities[Math.floor(Math.random() * possibleSeverities.length)];
  let publisherName = "publisher_test"
  let processName= "defaultProcess"
  let publisherV = "1"
  let state = "messageState"
  let login='operator1'
  let psswrd='test'
  let publishDateDisplayed = Cypress.moment().format('HH:mm DD/MM/YYYY')
  let startDate = Cypress.moment().add(1,'hour').format('x')
  let startdatedisplayed = Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY')
  //Verify that it is a number otherwise cy.log(typeof startDate)
  let startDateint = parseInt(startDate)
  let endDatedisplayed = (Cypress.moment().add(1,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
  const endDate = parseInt(Cypress.moment().add(1,'hour').add(1, 'day').format('x'))
  let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
  let red = 'rgb(167, 26, 26)'
  let green = 'rgb(0, 187, 3)'
  let bleue = 'rgb(16, 116, 173)'
  let yellow = 'rgb(253, 147, 18)'
  let processInstanceId = "Cy-" + startDate
  var color ='color';
          
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
  
  it('login and send a card', ()=>{

     cy.log(severity)
     cy.LogOpFab(login,psswrd)
     cy.log (startDate)
     cy.log (endDate)
     cy.log (startdatedisplayed)
     cy.log (endDatedisplayed)  
     cy.log(color)
     cy.log(processInstanceId)

     cy.get('#opfab-feed-filter-btn-sort').click()
     cy.get('#sort-form > :nth-child(2)').click()
     cy.PushCard(processName, publisherV, publisherName, processInstanceId, state, severity, startDateint, endDate)
     cy.goToSettings()
     cy.get('#opfab-setting-locale').select('en')
     cy.wait(500)
     cy.goToFeed()

// Check card created
//cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title').contains('MESSAGE')    

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex; width: 100%; margin-top: 5px;"] > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('#opfab-feed-light-card-defaultProcess-Cy-1615385745666 > :nth-child(1) > .p-1 > [style="display: flex;"]').contains('Message')    
cy.get('h4').contains('Hello ' + login+ ', you received the following message');
cy.get('.opfab-menu-item-left > .opfab-tab').contains('Message')
cy.get('.template-style').contains("a message")

cy.get('#opfab-selected-card').contains('Message received')

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(2) > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
cy.get('.opfab-card-received-footer').contains('Received at '+publishDateDisplayed)
cy.get('#opfab-card-details-btn-ack').contains('ACKNOWLEDGE AND CLOSE')
cy.log('card checked')
cy.wait(200)


cy.goToSettings()
cy.get('#opfab-setting-locale').select('fr')
cy.wait(500)
cy.goToFeed()

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex; width: 100%; margin-top: 5px;"] > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('#opfab-feed-light-card-defaultProcess-Cy-1615385745666 > :nth-child(1) > .p-1 > [style="display: flex;"]').contains('Message')    
cy.get('h4').contains('Bonjour ' + login+ ', vous avez reçu le message suivant');
cy.get('.opfab-menu-item-left > .opfab-tab').contains('Message')
cy.get('.template-style').contains("a message")

cy.get('#opfab-selected-card').contains('Message reçu')

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(2) > .badge-border')
cy.should('be.visible');
cy.should('have.css', 'background-color',color);
cy.get('.opfab-card-received-footer').contains('Reçu à '+publishDateDisplayed)
cy.get('#opfab-card-details-btn-ack').contains('ACQUITTER ET FERMER')
cy.log('card checked')

})
             

   })
