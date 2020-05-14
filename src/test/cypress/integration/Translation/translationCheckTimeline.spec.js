describe ('check_Timeline_translations',()=>{
    var lang
it('check current language',()=>{
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
         cy.log ('La langue courrant est '+ lang)
         }
        })
    })

it('check Timeline Buttons; change language and then recheck buttons',()=>{

  cy.LogOpFab('tso1-operator', 'test');
  cy.wait(2500)
  cy.checkTimelineButtons(lang)
  cy.goToSettings()
  cy.changeLangManually(lang)
  cy.wait(2500)
  cy.goToFeed()
  cy.wait(2500)
  cy.getLang().then(response =>
    {    
            lang=response
  cy.checkTimelineButtons(lang)
        })
})
})   
