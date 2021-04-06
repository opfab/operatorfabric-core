describe ('Hide timeline and check the business periods displayed',()=>{
    //check the current language

    let login='operator1'
    let password='test'

    let startDateRT=Cypress.moment().startOf('hour').subtract(2, 'hours').format('HH:mm DD/MM/YYYY')
    let endDateRT=Cypress.moment().startOf('hour').add(10, 'hours').format('HH:mm DD/MM/YYYY')

    let startDateDay=Cypress.moment().startOf('day').format('DD/MM/YYYY')
    let endDateDay=Cypress.moment().startOf('day').add(1, 'day').format('DD/MM/YYYY')


    let offset7D= (Cypress.moment().format('hh'))%4
    let startDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').format('HH:mm DD/MM/YYYY')
    let endDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(8,'day').format('HH:mm DD/MM/YYYY')

    let startDateWeek=Cypress.moment().startOf('week').add(-1,'day').format('DD/MM/YYYY')
    let endDateWeek=Cypress.moment().startOf('week').add(1,'week').add(-1,'day').format('DD/MM/YYYY')

    let startDateMonth=Cypress.moment().startOf('month').format('DD/MM/YYYY')
    let endDateMonth=Cypress.moment().startOf('month').add(1,'month').format('DD/MM/YYYY')

    let startDateYear=Cypress.moment().startOf('Year').format('YYYY')
    let endDateYear=Cypress.moment().startOf('Year').add(1,'Year').format('YYYY')

    beforeEach('Login, set EN and go to feed', ()=> {
        cy.LogOpFab(login, password)
        cy.waitDefaultTime()
        cy.goToSettings()
        // set to english
        cy.get('#opfab-setting-locale').select('en')
        cy.waitDefaultTime()

        //go to feed
        cy.goToFeed()
        cy.get('#opfab-navbar-menu-feed').click()
    } )

    it('Go to feed and check that the timeline is displayed and then hide the timeline',()=>{

        //check that the timeline is visible  
        cy.get('of-custom-timeline-chart').should('be.visible')

        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        //check the show timeline button  
        cy.get('a > span').contains('Show Timeline')
    })

    it('Check business period displayed for RT',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        //check that the business periods are displayed depending on period chosen
        //Realtime
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateRT+' -- '+endDateRT).should('be.visible')
        //Realtime move forward
        cy.get(':nth-child(8) > a').click()
        startDateRT=Cypress.moment().startOf('hour').format('HH:mm DD/MM/YYYY')
        endDateRT=Cypress.moment().startOf('hour').add(12, 'hours').format('HH:mm DD/MM/YYYY')
        cy.contains(startDateRT+' -- '+endDateRT).should('be.visible')

        //Realtime move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDateRT=Cypress.moment().startOf('hour').subtract(4, 'hours').format('HH:mm DD/MM/YYYY')
        endDateRT=Cypress.moment().startOf('hour').add(8, 'hours').format('HH:mm DD/MM/YYYY')
        cy.contains(startDateRT+' -- '+endDateRT).should('be.visible')
    })
    it('Check business period displayed for D',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')
        //Day
        cy.get('#opfab-timeline-link-period-J').click()
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
        //Day move forward
        cy.get(':nth-child(8) > a').click()
        startDateDay=Cypress.moment().startOf('day').add(1, 'day').format('DD/MM/YYYY')
        endDateDay=Cypress.moment().startOf('day').add(2, 'day').format('DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
        //Day move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDateDay=Cypress.moment().startOf('day').add(-2, 'day').format('DD/MM/YYYY')
        endDateDay=Cypress.moment().startOf('day').add(-1, 'day').format('DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
    })
    it('Check business period displayed for 7D',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        cy.log(offset7D)
        //7Day
        cy.get('#opfab-timeline-link-period-7D').click()
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
        //7D move forward
        cy.get(':nth-child(8) > a').click()
        startDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(1,'day').format('HH:mm DD/MM/YYYY')
        endDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(9,'day').format('HH:mm DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
        //7D move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(-1,'day').format('HH:mm DD/MM/YYYY')
        endDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(7,'day').format('HH:mm DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
    })
    it('Check business period displayed for W',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        //Week
        cy.get('#opfab-timeline-link-period-W').click()
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
        //Week move forward
        cy.get(':nth-child(8) > a').click()
        startDateWeek=Cypress.moment().startOf('week').add(1,'week').add(-1,'day').format('DD/MM/YYYY')
        endDateWeek=Cypress.moment().startOf('week').add(2,'week').add(-1,'day').format('DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
        //week move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDateWeek=Cypress.moment().startOf('week').add(-8,'day').format('DD/MM/YYYY')
        endDateWeek=Cypress.moment().startOf('week').add(-1,'day').format('DD/MM/YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
    })



    it('Check business period displayed for M',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        //Month
        cy.get('#opfab-timeline-link-period-M').click()
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateMonth+' -- '+endDateMonth).should('be.visible')
        //Month move forward
        cy.get(':nth-child(8) > a').click()
        startDateMonth=Cypress.moment().startOf('month').add(1,'month').format('DD/MM/YYYY')
        endDateMonth=Cypress.moment().startOf('month').add(2,'month').format('DD/MM/YYYY')
        cy.contains(startDateMonth+' -- '+endDateMonth).should('be.visible')

        //Month move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDateMonth=Cypress.moment().startOf('month').add(-1,'month').format('DD/MM/YYYY')
        endDateMonth=Cypress.moment().startOf('month').format('DD/MM/YYYY')
        cy.contains(startDateMonth+' -- '+endDateMonth).should('be.visible')
    })

    it('Check business period displayed for Y',()=>{
        //Hide the timeline
        cy.get('a > span').click()
        cy.get('.ngx-charts').should('not.exist')

        //Year
        cy.get('#opfab-timeline-link-period-Y').click()
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
        //Year move forward
        cy.get(':nth-child(8) > a').click()
        cy.get(':nth-child(8) > a').click()
        startDateYear=Cypress.moment().startOf('Year').add(2,'Year').format('YYYY')
        endDateYear=Cypress.moment().startOf('Year').add(3,'Year').format('YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
        //Year move backward 
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
        startDateYear=Cypress.moment().startOf('Year').add(-1,'Year').format('YYYY')
        endDateYear=Cypress.moment().startOf('Year').format('YYYY')
        cy.get('.opfab-business-period > span').contains('Business period')
        cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
    })

})