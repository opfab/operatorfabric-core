describe ('check_translations',()=>{  
    let red = 'rgb(238, 0, 0)'
    let green = 'rgb(0, 187, 0)'
    let bleue = 'rgb(16, 116, 172)'
    let yellow = 'rgb(253, 147, 18)'
    var color ='color';
    var lang;
it('Check Current Language',()=>{
    cy.getLang().then(reponse =>
     {
         if(reponse === 'en')
         {            
             lang=reponse
             cy.log('The current language is '+lang)
         }
         else
         {
         lang=reponse    
         cy.log ('La langue courante est '+ lang)
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
    let startdatedisplayed = Cypress.moment().format('L LT')
    let startdatedisplayedfr = Cypress.moment().format('DD/MM/YYYY HH:mm')
                           //Verify that it is a number otherwise cy.log(typeof startDate)
    let startDateint = parseInt(startDate) 
    let endDatedisplayed = (Cypress.moment().add(1, 'day').format('L LT'))
    let endDatedisplayedfr = (Cypress.moment().add(1, 'day').format('DD/MM/YYYY HH:mm'))
    const endDate = parseInt(Cypress.moment().add(1, 'day').format('x'))
    let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
    let dateDisplayedfr = "("+ startdatedisplayedfr + " - " + endDatedisplayedfr + ")"

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
    cy.LogOpFab('tso1-operator', 'test');
    cy.PushCard(processName, publisherV, publisherName, processId, message, severity, startDateint, endDate); 
    cy.wait(2000)
    cy.checkFeed(lang,color,dateDisplayed,dateDisplayedfr)
    cy.goToSettings()
    cy.changeLangManually(lang)
    cy.wait(1400)
    cy.goToFeed()
    cy.getLang().then(response =>
        {    
                lang=response
        cy.checkFeed(lang,color,dateDisplayed,dateDisplayedfr)     
        })

                })   
})