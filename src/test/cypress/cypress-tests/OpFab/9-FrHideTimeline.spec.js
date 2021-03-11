describe ('Check filter business period french version',()=>{
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
  
      it('Set french version',()=>{
  
      cy.LogOpFab(login, password)
      cy.wait(500)  
  
      cy.goToSettings()

    // set to english
      cy.get('#opfab-setting-locale').select('fr')
      cy.wait(500)
  })

  it('Go to feed and check that the timeline is displayed and then hide the timeline',()=>{
    //go to feed  
      cy.get('#opfab-navbar-menu-feed').click()

    //check that the timeline is visible  
      cy.get('.ngx-charts').should('be.visible')
     // cy.get('a > span').contains('Masquer la Timeline')

    //Hide the timeline

      cy.get('a > span').click()
      cy.get('.ngx-charts').should('not.be.visible')

    //check the show timeline button  
      //cy.get('a > span').contains('Afficher la Timeline')
  })

  it('Check business period displayed for RT',()=>{
    //check that the business periods are displayed depending on period choosen  
    //Realtime
      cy.get('.opfab-business-period > span').contains('Periode métier')
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

    //Day
  cy.get('#opfab-timeline-link-period-J').click()
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
    //Day move forward
  cy.get(':nth-child(8) > a').click()
  startDateDay=Cypress.moment().startOf('day').add(1, 'day').format('DD/MM/YYYY')
  endDateDay=Cypress.moment().startOf('day').add(2, 'day').format('DD/MM/YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
  //Day move backward 
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  startDateDay=Cypress.moment().startOf('day').add(-2, 'day').format('DD/MM/YYYY')
  endDateDay=Cypress.moment().startOf('day').add(-1, 'day').format('DD/MM/YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateDay+' -- '+endDateDay).should('be.visible')
})
  it('Check business period displayed for 7D',()=>{
    cy.log(offset7D)
    //7Day
    cy.get('#opfab-timeline-link-period-7D').click()
   cy.get('.opfab-business-period > span').contains('Periode métier')
    cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
    
    //7D move forward
    cy.get(':nth-child(8) > a').click()
    startDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(1,'day').format('HH:mm DD/MM/YYYY')
    endDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(9,'day').format('HH:mm DD/MM/YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
  //7D move backward 
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  startDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(-1,'day').format('HH:mm DD/MM/YYYY')
  endDate7Day=Cypress.moment().startOf('hour').add(-12-offset7D,'hour').add(7,'day').format('HH:mm DD/MM/YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDate7Day+' -- '+endDate7Day).should('be.visible')
})
  it('Check business period displayed for W',()=>{
      //Week
      cy.get('#opfab-timeline-link-period-W').click()
      cy.get('.opfab-business-period > span').contains('Periode métier')
      cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
      //Week move forward
      cy.get(':nth-child(8) > a').click()
      startDateWeek=Cypress.moment().startOf('week').add(1,'week').add(-1,'day').format('DD/MM/YYYY')
      endDateWeek=Cypress.moment().startOf('week').add(2,'week').add(-1,'day').format('DD/MM/YYYY')
      cy.get('.opfab-business-period > span').contains('Business ')
      cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
    //week move backward 
    cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
    cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
    startDateWeek=Cypress.moment().startOf('week').add(-8,'day').format('DD/MM/YYYY')
    endDateWeek=Cypress.moment().startOf('week').add(-1,'day').format('DD/MM/YYYY')
    cy.get('.opfab-business-period > span').contains('Periode métier')
    cy.contains(startDateWeek+' -- '+endDateWeek).should('be.visible')
})
  it('Check business period displayed for M',()=>{
    //Month
  cy.get('#opfab-timeline-link-period-M').click()
  cy.get('.opfab-business-period > span').contains('Periode métier')
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
    //Year
  cy.get('#opfab-timeline-link-period-Y').click()
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
      //Year move forward
  cy.get(':nth-child(8) > a').click()
  cy.get(':nth-child(8) > a').click()
  startDateYear=Cypress.moment().startOf('Year').add(2,'Year').format('YYYY')
  endDateYear=Cypress.moment().startOf('Year').add(3,'Year').format('YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
       //Year move backward 
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click()
  cy.get('#opfab-menu-timeline-links > ul > :nth-child(1) > a').click() 
  startDateYear=Cypress.moment().startOf('Year').add(-1,'Year').format('YYYY')
  endDateYear=Cypress.moment().startOf('Year').format('YYYY')
  cy.get('.opfab-business-period > span').contains('Periode métier')
  cy.contains(startDateYear+' -- '+endDateYear).should('be.visible')
  })

})