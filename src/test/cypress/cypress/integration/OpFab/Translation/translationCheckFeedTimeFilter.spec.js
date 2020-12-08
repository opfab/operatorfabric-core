// This test checks labels of time filter

describe ('Check_Feed_timefilter',()=>{
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
      it('login', ()=>
      {
        cy.LogOpFab(user, password);
        cy.goToFeedTimeFilter()
        cy.checkFeedTimeFilter(lang)
        cy.goToSettings()
        cy.changeLangManually(lang)
        cy.wait(1800)
        cy.goToFeed()
        cy.wait(1800)
        cy.getLang(user, password).then(response =>
            {       cy.wait(1800)
                    lang=response
                    cy.goToFeedTimeFilter()
                    cy.checkFeedTimeFilter(lang)
            } )  
    })
  })
