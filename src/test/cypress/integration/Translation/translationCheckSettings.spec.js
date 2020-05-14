describe ('ckeckSettingsTranslation',()=>{
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
        cy.log ('La langue choisie est '+ lang)
        }
    })
})

it ('Check settings page labels, change language then recheck',()=>{ 
    cy.LogOpFab('tso1-operator', 'test');
        cy.goToSettings();
        cy.checkSettingsTranslation(lang)
        cy.log('Labels have been verified for the following language  ' + lang)
    if (lang=='fr'){
       cy.get('.form-group').eq(1).click();
       cy.get('select').eq(0).select('en')
       lang='en'
    } else {
       cy.get('.form-group').eq(1).click();
      cy.get('select').eq(0).select('fr');
      lang='fr';
    }
    cy.checkSettingsTranslation(lang)
})
})