// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
  describe ('Check_Severity Filters',()=>{
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
        cy.LogOpFab(user,password)
        cy.goToFeedSeverityFilter()
        cy.checkFeedSeverityFilter(lang)
        cy.goToSettings()
        cy.changeLangManually(lang)
        cy.wait(1800)
        cy.goToFeed()
        cy.wait(1800)
        cy.getLang(user,password).then(response =>
            {       cy.wait(1800)
                    lang=response
                    cy.goToFeedSeverityFilter()
                    cy.checkFeedSeverityFilter(lang)     
            }) 
          }) 
        }) 