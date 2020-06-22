describe ('Check Feed Severity Filter',()=>{
    var lang
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

        it('Check Severity Filters, change language and then recheck', ()=>
        {
            cy.LogOpFab('tso1-operator', 'test');
            cy.goToFeedSeverityFilter()
            cy.checkFeedSeverityFilter(lang)
            cy.goToSettings()
            cy.changeLangManually(lang)
            cy.wait(1800)
            cy.goToFeed()
            cy.wait(1800)
            cy.getLang().then(response =>
                {       cy.wait(1800)
                        lang=response
                        cy.goToFeedSeverityFilter()
                        cy.checkFeedSeverityFilter(lang)     
                })
    })
})