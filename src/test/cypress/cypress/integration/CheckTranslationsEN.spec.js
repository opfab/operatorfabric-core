describe ('CheckTranslations',()=>{
    //check the current language
    
        let login='operator1'
        let password='test'
    
        it('Set French version',()=>{
    
        cy.LogOpFab(login, password)
        cy.waitDefaultTime()
    
        cy.goToSettings()
      
        cy.get('#opfab-setting-locale').select('en')
        cy.waitDefaultTime()
    })
        
    it('Check nav bar english translation',()=>{  
        cy.goToFeed()  
    
        cy.get('#opfab-navbar-menu-feed').contains('Feed')
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
    
        cy.get('#opfab-navbar-menu-menu1').contains('Single menu entry')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#opfab-navbar-menu-dropdown-menu2').contains('Second menu')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.log('Navbar labels check sucessfully')
    })   
    
    
        it('Check timeline translation',()=>{  
        cy.get('#opfab-timeline-link-period-TR').contains('Real Time')
        cy.should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.should('be.visible') 
    
        cy.get('#opfab-timeline-link-period-J').contains('Day')
        cy.should('be.visible')  
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#opfab-timeline-link-period-7D').contains(' 7 Day')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')    
    
        cy.get('#opfab-timeline-link-period-W').contains('Week')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')   
    
        cy.get('#opfab-timeline-link-period-M').contains('Month')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')    
        cy.get('#opfab-timeline-link-period-Y').contains('Year')
        cy.should('be.visible')  
        cy.get('a > span').contains('Hide Timeline')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.should('be.visible')
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
    
        cy.get('.label-sev-compliant').contains('Compliant')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('.label-sev-information').contains('Information')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get(':nth-child(3) > .row > span').contains('Acknowledgement')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#ack-filter-form > :nth-child(1) > [translate=""]').contains('All')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#ack-filter-form > :nth-child(2) > [translate=""]').contains('Acknowledged')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#ack-filter-form > :nth-child(3) > [translate=""]').contains('Not acknowledged')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('[style="width: 300px;"] > .row > span').contains('Receipt date')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#opfab-feed-filter-dateTimeFrom > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('Start')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#opfab-feed-filter-dateTimeTo > table.ng-star-inserted > tr > :nth-child(1) > .nopaddingrow > label').contains('End')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.waitDefaultTime()
    })
    
        it('Check sorting options translation',()=>{
            cy.LogOpFab(login, password)
        cy.get('#opfab-feed-filter-btn-sort').should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.get('#opfab-feed-filter-btn-sort').click()
    
        
        //sorting 
        cy.get('.row > span').contains('Sort by')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#sort-form > :nth-child(1) > [translate=""]').contains('Unread then date')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#sort-form > :nth-child(2) > [translate=""]').contains('Date')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#sort-form > :nth-child(3) > [translate=""]').contains('Criticality then date')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.waitDefaultTime()
    
    })
    
    
    it('Check archives',()=>{
        //the test fails from time to time and when i login again it works
        cy.LogOpFab(login, password)
        cy.get('#opfab-navbar-menu-archives').click()
        cy.should('be.visible')
    
        cy.get('#processGroup .opfab-multiselect > label').contains('SERVICE')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#process:not([hidden]) .opfab-multiselect > label').contains('PROCESS')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('of-datetime-filter[filterPath="publishDateFrom"] label').contains("PUBLISH FROM")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('of-datetime-filter[filterPath="activeFrom"] label').contains("ACTIVE FROM")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#tags .opfab-multiselect > label').contains("TAGS")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#state .opfab-multiselect > label').contains("STATE")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('of-datetime-filter[filterPath="publishDateTo"] label').contains('PUBLISH TO')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('of-datetime-filter[filterPath="activeTo"] label').contains("ACTIVE TO")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#processGroup .opfab-multiselect span').contains("Select a Service")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#process:not([hidden]) .opfab-multiselect span').contains("Select a Process")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#tags .opfab-multiselect span').contains("Select a Tag")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#state .opfab-multiselect span').contains("Select a State")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')
    
        cy.get('#opfab-archives-btn-search').contains('SEARCH')
        cy.should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.should('be.visible')

        cy.waitDefaultTime()

    })
    
    it('Check Monitoring',()=>{
        cy.LogOpFab(login, password)
        cy.waitDefaultTime()
        //Go to monitoring
        cy.get('#opfab-navbar-menu-monitoring').click()
    
        //Check each  field label
        cy.get('#processGroup .opfab-multiselect > label').contains('SERVICE')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#processGroup .opfab-multiselect span').contains("Select a Service")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#process:not([hidden]) .opfab-multiselect > label').contains('PROCESS')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
    
        cy.get('#process:not([hidden]) .opfab-multiselect span').contains('Select a Process')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')

        //TODO Add tests process status
        //TODO Add tests for business period header

        cy.get('#opfab-monitoring-btn-search').contains('SEARCH')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(255, 255, 255)')
    
        cy.get('#opfab-monitoring-btn-reset').contains('RESET')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(39, 132, 255)')
        cy.waitDefaultTime()
    
    })
    
    
    it('Check Logging',()=>{
        cy.LogOpFab(login, password)
        cy.waitDefaultTime()
        //Go to Logging page
        cy.get('#opfab-navbar-menu-logging').click()

        //Check each  field label
        cy.get('#processGroup .opfab-multiselect > label').contains('SERVICE')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#process:not([hidden]) .opfab-multiselect > label').contains('PROCESS')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('of-datetime-filter[filterPath="publishDateFrom"] label').contains("PUBLISH FROM")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('of-datetime-filter[filterPath="activeFrom"] label').contains("ACTIVE FROM")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#tags .opfab-multiselect > label').contains("TAGS")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#state .opfab-multiselect > label').contains("STATE")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('of-datetime-filter[filterPath="publishDateTo"] label').contains('PUBLISH TO')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('of-datetime-filter[filterPath="activeTo"] label').contains("ACTIVE TO")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#processGroup .opfab-multiselect span').contains("Select a Service")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#process:not([hidden]) .opfab-multiselect span').contains("Select a Process")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#tags .opfab-multiselect span').contains("Select a Tag")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#state .opfab-multiselect span').contains("Select a State")
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')
        cy.should('be.visible')

        cy.get('#opfab-logging-btn-search').contains('SEARCH')
        cy.should('have.css', 'color', 'rgb(255, 255, 255)')
        cy.should('be.visible')

        cy.get('#opfab-logging-btn-cancel').contains('RESET')
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(39, 132, 255)')

        cy.waitDefaultTime()
    })
        it('user name',()=>{
            cy.LogOpFab(login, password)
        cy.get('.user-name').contains(login)
        cy.should('be.visible')
        cy.should('have.css', 'color', 'rgb(186, 186, 186)')     
    
    })
    
    it('Check banner',()=>{
        cy.LogOpFab(login, password)
    cy.get('[style="width: 80px; height: 87px; overflow: hidden; margin-top: -30px; margin-bottom: -20px; margin-left: -50px; margin-right: -15px;"] > div').contains('TEST ENV')
    cy.should('be.visible')
    cy.should('have.css', 'color', 'rgb(255, 255, 255)')
    
    })
    
    })