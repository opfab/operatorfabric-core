describe ('checkArchivesTranslations',()=>{
   var lang
it('Check Language',()=>{
   cy.reload()
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
it ('Check Archives Page labels, change language then recheck',()=>{
   cy.LogOpFab('tso1-operator', 'test');
   cy.wait(500)
   cy.goToArchives()
   cy.checkArchivesLabels(lang)
   cy.goToSettings()
   cy.changeLangManually(lang)
   cy.wait(1200)
   cy.goToArchives()
   cy.getLang().then(response =>
            {    
        lang=response
        cy.checkArchivesLabels(lang)
        })
})
})