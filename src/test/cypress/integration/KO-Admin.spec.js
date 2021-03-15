describe ('Admin',()=>{
    //check the current language
    
        let login='admin'
        let password='test'
    
        it('Set English version',()=>{
    
        cy.LogOpFab(login, password)
        cy.wait(500)  
    
        cy.goToSettings()

      // set to english
        cy.get('#opfab-setting-locale').select('en')
        cy.wait(500)
    })

    it('Admin',()=>{
      //go to admin page 
      cy.goToSettings()
      cy.get('#opfab-navbar-right-menu-admin > [translate=""]').click()
      cy.get('.nav > :nth-child(1) > .nav-link').click()
      cy.wait(1000)
      cy.get('.nav > :nth-child(2) > .nav-link').click()
      cy.wait(1000)

      //
    })

  })