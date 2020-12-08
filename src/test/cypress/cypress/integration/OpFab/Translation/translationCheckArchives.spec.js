//Send a card and verify that the content is well displayed for both lang

describe ('CheckCardArchivesTranslations',()=>{
  var lang
  let red = 'rgb(238, 0, 0)'
  let green = 'rgb(0, 187, 0)'
  let bleue = 'rgb(16, 116, 172)'
  let yellow = 'rgb(253, 147, 18)'
  var color ='color'
  let user = 'operator1'
  let password='test'
it('Check current language',()=>{
//returns the current language if it is not set the test will fail  
  cy.getLang(user,password).then(reponse =>
   {
       if(reponse === 'en')
       {           
           lang=reponse
           cy.log('The current language is '+lang)
       }
       else
       {
       lang=reponse   
       cy.log ('La langue choisie est '+ lang)
       }
   })
})
it ('Send a card, check it content, change language then recheck',()=>{
//send a random card
  cy.LogOpFab(user, password);
let possibleSeverities= ['ALARM', 'ACTION', 'INFORMATION', 'COMPLIANT'];
let severity = possibleSeverities[Math.floor(Math.random() * possibleSeverities.length)];
cy.log(severity)
let message = "messageState"
let publisherV = "1"
let publisherName = "api_test"
let processName = "defaultProcess"
let startDate = Cypress.moment().format('x')
let startdatedisplayed = Cypress.moment().format('HH:mm DD/MM/YYYY')
//Verify that it is a number otherwise cy.log(typeof startDate)
let startDateint = parseInt(startDate)
let endDatedisplayed = (Cypress.moment().add(1, 'day').format('HH:mm DD/MM/YYYY'))

const endDate = parseInt(Cypress.moment().add(1, 'day').format('x'))
let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"

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
     let processId = "Cy-" + startDate
     cy.log(processId)
     cy.PushCard(processName, publisherV, publisherName, processId, message, severity, startDateint, endDate);
     cy.wait(1000)

cy.goToArchives();
cy.get('.form-group > .row > :nth-child(1)').click();
cy.checkArchivedCard(user,lang,color,dateDisplayed)
cy.wait(900)
cy.goToSettings()
//Change language
cy.changeLangManually(lang)
cy.wait(1200)
cy.goToArchives();
cy.wait(900)
cy.get('.form-group > .row > :nth-child(1)').click();
cy.getLang(user,password).then(response =>
   {   
           lang=response
//check translations for new card           
   cy.checkArchivedCard(user,lang,color,dateDisplayed)    
   })
           })
          
})

