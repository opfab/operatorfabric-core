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
  let publishDate = Cypress.moment().format('L LT')
  let publishDateDisplayed = Cypress.moment().format('HH:mm DD/MM/YYYY')
  let startDate = Cypress.moment().add(1,'hour').format('x')
  let startdatedisplayed = Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY')
  //Verify that it is a number otherwise cy.log(typeof startDate)
  let startDateint = parseInt(startDate)
  let endDatedisplayed = (Cypress.moment().add(1,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
  const endDate = parseInt(Cypress.moment().add(1,'hour').add(1, 'day').format('x'))
  let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
  let red = 'rgb(238, 0, 0)'
  let green = 'rgb(0, 187, 0)'
  let bleue = 'rgb(16, 116, 172)'
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

     cy.PushCard(processName, publisherV, publisherName, processInstanceId, state, severity, startDateint, endDate);
     cy.wait(500)

     cy.log(color) 

// Check card created
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > :nth-child(1) > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('h2').contains('Hello ' + login+ ', you received the following message');
//cy.get('span[class="nav-link"]').eq(0).contains('Message');
cy.get('.nav > .nav-item > .nav-link').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')

cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.log('[blue](card checked) ')
cy.wait(200)
cy.log("Moving now to check the timeline's buttons")
//check timeline

//cy.goToTimelineD();
//cy.wait(200)
//cy.goToTimelineSD();
//cy.wait(200)
//cy.goToTimelineM();
//cy.wait(200)
//cy.goToTimelineY();
//cy.wait(200)
//cy.goToTimelineRT();
//cy.wait(200)
//cy.nextButton();
//cy.wait(200)
//cy.previousButton();
//cy.wait(200)

//cy.homeButton();
//cy.wait(200)

//cy.log("Timeline's button checked")

//cy.timelineRTChekMinutes();
//cy.log("Timeline's RT grid checked")
//cy.wait(200)
//cy.log("Search the card on archives ")

//check archives



cy.goToArchives();
cy.get('.form-group > .row > :nth-child(1)').click()


cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
cy.get('h2').contains('Hello ' + login+ ', you received the following message');

cy.get('.nav > .nav-item > .nav-link').contains('Message')
cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')

cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
cy.should('be.visible');
cy.should('have.css', 'background-color',color);

cy.goToSettings()
//Check settings labels if they are displayed well
cy.get(':nth-child(1) > of-list-setting > form.ng-untouched > .form-group > label').contains('Language').should('be.visible')
cy.get(':nth-child(2) > of-list-setting > form.ng-untouched > .form-group > label').contains('Time zone').should('be.visible')
cy.get('#time-filter-form > .form-group > label').contains('Default tags').should('be.visible')
cy.get(':nth-child(4) > :nth-child(1) > label').contains('Play sounds for cards with severity').should('be.visible')
cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Alarm').should('be.visible')
cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Action').should('be.visible')
cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Compliant').should('be.visible')
cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Information').should('be.visible')

//Check if the severity checkboxes are displaued well
cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > #setting').should('be.visible')
cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > #setting').should('be.visible')
cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > #setting').should('be.visible')
cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > #setting').should('be.visible')

// check that the settings fields for Language , timezone and default tags are visible
cy.get(':nth-child(1) > of-list-setting > form.ng-untouched > .form-group > #setting').should('be.visible')
cy.get(':nth-child(2) > of-list-setting > form.ng-untouched > .form-group > #setting').should('be.visible')
cy.get('#time-filter-form > .form-group > #setting').should('be.visible')

cy.log("Settings page checked, return to feed")
cy.wait(1200)


cy.get(':nth-child(4) > .nav-link').click()
//cy.get('tbody > :nth-child(1) > :nth-child(1)').contains(publishDateDisplayed)
cy.get('tbody > :nth-child(1) > :nth-child(2)').contains(startdatedisplayed)
cy.get('tbody > :nth-child(1) > :nth-child(3)').contains(endDatedisplayed)
cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('Process example')
cy.get('tbody > :nth-child(1) > :nth-child(5)').contains('Message')
cy.get('tbody > :nth-child(1) > :nth-child(6)').contains('Message received')
cy.get('tbody > :nth-child(1) > :nth-child(7)').contains('Message')
cy.get(':nth-child(1) > :nth-child(8) > .btn')
       

cy.wait(1200)
cy.get(':nth-child(5) > .nav-link').click()
cy.wait(500)
cy.get('.form-group > .row > :nth-child(1)').click()
cy.wait(1200)
//cy.get('tbody > :nth-child(1) > :nth-child(1)').contains(publishDate)
cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('Message')
cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('Message received')
//cy.get('tbody > :nth-child(1) > :nth-child(4)').should('be.visible').should('have.css', 'background-color',color);
cy.get('tbody > :nth-child(1) > :nth-child(5)').contains('SYSTEM')
})
             

   })
