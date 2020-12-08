
//there is an issue with this test sometimes the "TR" button in french isn't 

describe ('check_Timeline_translations',()=>{
  var lang
  let user='operator1'
  let password='test'
it('check current language',()=>{
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


it('check Timeline Buttons; change language and then recheck buttons',()=>{

cy.LogOpFab(user, password);
cy.wait(2500)
cy.checkTimelineButtons(lang)
cy.goToSettings()
cy.changeLangManually(lang)
cy.wait(500)
cy.goToFeed()
cy.wait(500)
cy.getLang(user,password).then(response =>
  {   
          lang=response
cy.checkTimelineButtons(lang)
      })
})
})