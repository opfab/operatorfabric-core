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
    





it('Check archives',()=>{

    cy.get('#opfab-navbar-menu-archives').click()
    cy.get('#opfab-archives-btn-search').click().click()
    cy.debug()


})

})