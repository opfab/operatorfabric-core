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
    
it('Check nav bar translation',()=>{  
    cy.goToFeed()  

    cy.get('#opfab-navbar-menu-feed').contains('Flux de cartes')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')

    cy.get('#opfab-navbar-menu-archives').contains('Archives')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-navbar-menu-monitoring').contains('Monitoring')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-navbar-menu-logging').contains('Logging')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-navbar-menu-menu1').contains('Unique menu entry')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-navbar-menu-dropdown-menu2').contains('Deuxieme menu')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.log('Navbar labels check sucessfully')
    cy.wait(500)

})   


    it('Check timeline translation',()=>{  
    cy.get('#opfab-timeline-link-period-TR').contains('Temps réel')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')
    cy.should('be.visible') 

    cy.get('#opfab-timeline-link-period-J').contains('Jour')
    cy.should('be.visible')  
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-timeline-link-period-7D').contains(' 7 Jours')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')    

    cy.get('#opfab-timeline-link-period-W').contains('Semaine')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')   

    cy.get('#opfab-timeline-link-period-M').contains('Mois')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')    
    cy.get('#opfab-timeline-link-period-Y').contains('Année')
    cy.should('be.visible')  
    cy.get('a > span').contains('Masquer la timeline')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.should('be.visible')
    cy.wait(500)
})

it('Check Feed Filters  translation',()=>{
    cy.get('#opfab-feed-filter-btn-filter').should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.get('#opfab-feed-filter-btn-filter').click()

    cy.get('.opfab-filter-type-header > span').contains('Type') 
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('.label-sev-alarm').contains('Alarm')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('.label-sev-action').contains('Action')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('.label-sev-compliant').contains('Conforme')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('.label-sev-information').contains('Information')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get(':nth-child(3) > .row > span').contains('Acquittement')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#ack-filter-form > :nth-child(1) > [translate=""]').contains('Toutes')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#ack-filter-form > :nth-child(2) > [translate=""]').contains('Acquittées')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#ack-filter-form > :nth-child(3) > [translate=""]').contains('Non acquittées')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="width: 300px;"] > .row > span').contains('Date de réception')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-feed-filter-dateTimeFrom > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('Début')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-feed-filter-dateTimeTo > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('Fin')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.wait(500)
})

    it('Check sorting options translation',()=>{
    cy.get('#opfab-feed-filter-btn-sort').should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.get('#opfab-feed-filter-btn-sort').click()

    
    //sorting 
    cy.get('.row > span').contains('Triées par')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#sort-form > :nth-child(1) > [translate=""]').contains('Non lu puis date')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#sort-form > :nth-child(2) > [translate=""]').contains('Date')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#sort-form > :nth-child(3) > [translate=""]').contains('Criticité puis date')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.wait(500)

})


it('Check archives',()=>{
    //the test fails from time to time and when i login again it works
    cy.LogOpFab(login, password)
    cy.get('#opfab-navbar-menu-archives').click()
    cy.should('be.visible')

    cy.get('#service > :nth-child(1) > .opfab-multiselect > [translate=""]').contains('SERVICE')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get(':nth-child(2) > :nth-child(1) > .opfab-multiselect > [translate=""]').contains('PROCESSUS')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("PUBLIE A PARTIR DE")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE A PARTIR DE")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#tags > :nth-child(1) > .opfab-multiselect > [translate=""]').contains("ETIQUETTES")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#state > :nth-child(1) > .opfab-multiselect > [translate=""]').contains("ETAT")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('PUBLIE JUSQU\'A')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE JUSQU\'A")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#service > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Service")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get(':nth-child(2) > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Processus")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#tags > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner une Etiquette")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#state > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Etat")
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.should('be.visible')

    cy.get('#opfab-archives-btn-search').contains('RECHERCHER')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')
    cy.should('be.visible')

    cy.should('be.visible') 
    cy.wait(500) 


})

it('Check Monitoring',()=>{
    cy.wait(500)
    //Go to monitoring 
    cy.get('#opfab-navbar-menu-monitoring').click()

    //Check each  field label
    cy.get('.opfab-multiselect > [translate=""]').contains('PROCESSUS')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('.c-btn > :nth-child(1)').contains('Sélectionner un Processus')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("PUBLIE A PARTIR DE")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE A PARTIR DE")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('PUBLIE JUSQU\'A')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE JUSQU\'A")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-monitoring-btn-search').contains('RECHERCHER')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')

    cy.get('#opfab-monitoring-btn-reset').contains('REINITIALISER')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(39, 132, 255)')
    cy.wait(500)

})


it('Check Logging',()=>{

    //Go to Logging page
    cy.get('#opfab-navbar-menu-logging').click()

    //Check each  field label

    cy.get('#service > :nth-child(1) > .opfab-multiselect > [translate=""]').contains('SERVICE')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get(':nth-child(2) > :nth-child(1) > .opfab-multiselect > [translate=""]').contains('PROCESSUS')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("PUBLIE A PARTIR DE")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(1) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE A PARTIR DE")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#tags > :nth-child(1) > .opfab-multiselect > [translate=""]').contains("ETIQUETTES")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#state > :nth-child(1) > .opfab-multiselect > [translate=""]').contains("ETAT")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; margin-right: 30px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('PUBLIE JUSQU\'A')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('[style="margin-left: 40px; width: 230px; min-width: 230px;"] > :nth-child(2) > of-datetime-filter.ng-untouched > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains("ACTIVE JUSQU\'A")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#opfab-logging-btn-search').contains('RECHERCHER')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')

    cy.get('#opfab-logging-btn-cancel').contains('REINITIALISER')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(39, 132, 255)')     

    cy.get('#service > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Service")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get(':nth-child(2) > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Processus")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')

    cy.get('#tags > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner une Etiquette")
    cy.should('be.visible') 
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    cy.get('#state > :nth-child(1) > .opfab-multiselect > angular2-multiselect.ng-untouched > .cuppa-dropdown > .selected-list > .c-btn > :nth-child(1)').contains("Sélectionner un Etat")
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)') 
    cy.wait(500)    

})
    it('user name',()=>{
    cy.get('.user-name').contains(login)
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(186, 186, 186)')     

})

it('Check banner',()=>{
cy.get('[style="width: 80px; height: 87px; overflow: hidden; margin-top: -30px; margin-bottom: -20px; margin-left: -50px; margin-right: -15px;"] > div').contains('TEST ENV')
cy.should('be.visible')
cy.should('have.css', 'color', 'rgb(255, 255, 255)')

})

})