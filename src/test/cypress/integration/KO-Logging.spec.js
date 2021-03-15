describe ('CheckTranslations',()=>{
//check the current language

    let login='operator1'
    let password='test'

    it('Set French version',()=>{

    cy.LogOpFab(login, password)
    cy.wait(500)  

    cy.goToSettings()
  
    cy.get('#opfab-setting-locale').select('fr')
    cy.wait(500)
})
    





it('Check logging',()=>{

    cy.get('#opfab-navbar-menu-logging').click()
    cy.get('#opfab-logging-btn-search').click()



})

})