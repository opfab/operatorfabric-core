describe ('NotificationManagementScreen',()=>{


    let login='operator1'
    let password='test'
    let ID1=Cypress.moment().format('x')
    let ID2=ID1+1
    it('Create Manually a card and check ',()=>{

        cy.LogOpFab(login, password)
        cy.waitDefaultTime()

        //Change locale to French as rest of the test relies on French translations
        cy.goToSettings()
        cy.get('#opfab-setting-locale').select('fr')
        cy.waitDefaultTime()
        cy.goToFeed()

        //Send Incident iT CARD
        cy.get('.opfab-menu-icon-newcard').click()
        cy.get('.col.ng-star-inserted > of-single-filter > .opfab-select > .ng-pristine').select('Service numéro 1')
        cy.get(':nth-child(2) > .opfab-select > .ng-untouched').select('Exemples de nouvelles cartes')
        cy.get(':nth-child(3) > of-single-filter > .opfab-select > .ng-untouched').select('Incident SI')
        cy.waitDefaultTime()
        cy.get('#message').type('Test Manuel'+ID1)
        cy.get(':nth-child(1) > .opfab-checkbox > .opfab-checkbox-checkmark').click()
        cy.get('#OTHERS').type('Manual Test-'+ID1)
        cy.get('.c-btn').click()
        cy.get('.lazyContainer > :nth-child(1)').click()
        cy.get('.lazyContainer > :nth-child(2)').click()
        cy.get('.lazyContainer > :nth-child(3)').click()
        cy.get('#opfab-usercard-btn-prepareCard').click()
        cy.get('#opfab-usercard-btn-accept').click()
        cy.get('#div-detail-msg > #opfab-usercard-close > span').click()
        cy.contains('incident')


        //go to configuration screen
        cy.get('.navbar-right > .nav-item').click()

        cy.get('#opfab-navbar-right-menu-feedconfiguration > [translate=""]').click()
        cy.waitDefaultTime()

        cy.get(':nth-child(2) > :nth-child(1) > [style="margin-left: 20px;"] > :nth-child(2) > .opfab-checkbox').click()
        cy.get(':nth-child(2) > :nth-child(1) > [style="margin-left: 20px;"] > :nth-child(1) > .opfab-checkbox > .opfab-checkbox-checkmark').click()
        cy.get('#opfab-feedconfiguration-btn-confirm').click()
        cy.get('#opfab-feedconfiguration-btn-yes').click()
        cy.get('#opfab-navbar-menu-feed').click()
        cy.contains('incident').should('not.exist')


        //Return to itial configuration
        cy.get('.navbar-right > .nav-item').click()

        cy.get('#opfab-navbar-right-menu-feedconfiguration > [translate=""]').click()
        cy.waitDefaultTime()

        cy.get(':nth-child(2) > :nth-child(1) > [style="margin-left: 20px;"] > :nth-child(2) > .opfab-checkbox').click()
        cy.get(':nth-child(2) > :nth-child(1) > [style="margin-left: 20px;"] > :nth-child(1) > .opfab-checkbox > .opfab-checkbox-checkmark').click()
        cy.get('#opfab-feedconfiguration-btn-confirm').click()
        cy.get('#opfab-feedconfiguration-btn-yes').click()

    })

})