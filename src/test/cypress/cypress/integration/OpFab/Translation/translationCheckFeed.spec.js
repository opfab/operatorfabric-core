// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('Check_Severity Filters',()=>{
  let red = 'rgb(238, 0, 0)'
  let green = 'rgb(0, 187, 0)'
  let bleue = 'rgb(16, 116, 172)'
  let yellow = 'rgb(253, 147, 18)'
  var color ='color'
  var lang
  let user='operator1'
  let password='test'
it('Check Language',()=>{
  cy.getLang(user,password).then(reponse =>
   {
       if(reponse == 'en')
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
  
      it ('Send random Card, Check labels, change lang and recheck labels',()=>{
        //send a random card
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
       let processId = "Cy-" + startDate
       cy.LogOpFab(user, password);
       cy.PushCard(processName, publisherV, publisherName, processId, message, severity, startDateint, endDate); 
       cy.wait(2000)
       //unsort by read/unread so that the card will be displayed at the top of the feed when we come back after changing the language 
       cy.get('of-read-sort > .ng-star-inserted > .btn > .ng-fa-icon > .svg-inline--fa > path').click()
       cy.checkFeed(user,lang,color,dateDisplayed)
       cy.goToSettings()
       cy.changeLangManually(lang)
       cy.wait(1400)
       cy.goToFeed()
       cy.getLang(user,password).then(response =>
           {    
                   lang=response
           cy.checkFeed(user,lang,color,dateDisplayed)     
           })
   
                   })   
})