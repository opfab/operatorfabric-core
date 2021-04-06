describe ('CheckTimeline',()=>{

       let login='operator1'
       let password='test'
       let red = 'rgb(238, 0, 0)'
       let green = 'rgb(0, 187, 3)'
       let bleue = 'rgb(16, 116, 173)'
       let orange = 'rgb(253, 147, 18)'
       //Send 7 different cards and then check all pages
   
       //First Card
       let processInstanceId1 = "cypress-timeline-1"
       let severity1 = 'ACTION'
       let publisherName1 = "publisher_test"
       let processName1= "defaultProcess"
       let publisherV1 = "1"
       let state1 = "messageState"
       let publishDate1 = Cypress.moment().format('L LT')
       let publishDateDisplayed1 = Cypress.moment().format('HH:mm DD/MM/YYYY')
       let startDate1 = Cypress.moment().add(11,'hour').format('x')
       let startdatedisplayed1 = Cypress.moment().add(11,'hour').format('HH:mm DD/MM/YYYY')
   
       let startDateint1 = parseInt(startDate1)
       let endDatedisplayed1 = (Cypress.moment().add(11,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
       const endDate1= parseInt(Cypress.moment().add(11,'hour').add(1, 'day').format('x'))
       let dateDisplayed1= "("+ startdatedisplayed1 + " - " + endDatedisplayed1 + ")"
   
   
       //Second Card
       let processInstanceId2 = "cypress-timeline-2"
       let severity2 = 'INFORMATION'
       let publisherName2 = "publisher_test"
       let processName2= "defaultProcess"
       let publisherV2= "1"
       let state2= "messageState"
       let publishDate2 = Cypress.moment().format('L LT')
       let publishDateDisplayed2 = Cypress.moment().format('HH:mm DD/MM/YYYY')
       let startDate2 = Cypress.moment().add(1,'hour').format('x')
       let startdatedisplayed2 = Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY')
       let startDateint2 = parseInt(startDate2)
       let endDatedisplayed2 = (Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY'))
       const endDate2= parseInt(Cypress.moment().add(1,'hour').format('x'))
       let dateDisplayed2= "("+ startdatedisplayed2 + " - " + endDatedisplayed2 + ")"
   
           //Third Card
       let processInstanceId3 = "cypress-timeline-3"
       let severity3 = 'ALARM'
       let publisherName3 = "publisher_test"
       let processName3= "defaultProcess"
       let publisherV3= "1"
       let state3= "messageState"
       let publishDate3 = Cypress.moment().format('L LT')
       let publishDateDisplayed3 = Cypress.moment().format('HH:mm DD/MM/YYYY')
       let startDate3 = Cypress.moment().add(48,'hour').format('x')
       let startdatedisplayed3 = Cypress.moment().add(48,'hour').format('HH:mm DD/MM/YYYY')
       let startDateint3 = parseInt(startDate3)
       let endDatedisplayed3 = (Cypress.moment().add(48,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
       const endDate3= parseInt(Cypress.moment().add(48,'hour').add(1, 'day').format('x'))
       let dateDisplayed3= "("+ startdatedisplayed3 + " - " + endDatedisplayed3 + ")"
   
                   //4th Card
       let processInstanceId4 = "cypress-timeline-4"
       let severity4 = 'COMPLIANT'
       let publisherName4 = "publisher_test"
       let processName4= "defaultProcess"
       let publisherV4= "1"
       let state4= "messageState"
       let publishDate4 = Cypress.moment().format('L LT')
       let publishDateDisplayed4 = Cypress.moment().format('HH:mm DD/MM/YYYY')
       let startDate4 = Cypress.moment().add(9,'day').format('x')
       let startdatedisplayed4= Cypress.moment().add(9,'day').format('HH:mm DD/MM/YYYY')
       let startDateint4 = parseInt(startDate4)
       let endDatedisplayed4 = (Cypress.moment().add(10,'day').format('HH:mm DD/MM/YYYY'))
       const endDate4= parseInt(Cypress.moment().add(10,'day').format('x'))
       let dateDisplayed4= "("+ startdatedisplayed4 + " - " + endDatedisplayed4 + ")"
       
       //5th Card
       let processInstanceId5 = "cypress-timeline-5"
       let severity5 = 'ALARM'
       let publisherName5 = "publisher_test"
       let processName5= "defaultProcess"
       let publisherV5= "1"
       let state5= "messageState"
       let publishDate5 = Cypress.moment().format('L LT')
       let publishDateDisplayed5 = Cypress.moment().format('HH:mm DD/MM/YYYY')
       let startDate5 = Cypress.moment().add(1,'month').format('x')
       let startdatedisplayed5= Cypress.moment().add(1,'month').format('HH:mm DD/MM/YYYY')
       let startDateint5 = parseInt(startDate4)
       let endDatedisplayed5 = (Cypress.moment().add(1,'month').add(1, 'day').format('HH:mm DD/MM/YYYY'))
       const endDate5= parseInt(Cypress.moment().add(1,'month').add(1, 'day').format('x'))
       let dateDisplayed5= "("+ startdatedisplayed5 + " - " + endDatedisplayed5 + ")"
                   
   //6th Card
   let processInstanceId6 = "cypress-timeline-6"
   let severity6 = 'COMPLIANT'
   let publisherName6 = "publisher_test"
   let processName6= "defaultProcess"
   let publisherV6= "1"
   let state6= "messageState"
   let publishDate6 = Cypress.moment().format('L LT')
   let publishDateDisplayed6 = Cypress.moment().format('HH:mm DD/MM/YYYY')
   let startDate6= Cypress.moment().add(1,'month').format('x')
   let startdatedisplayed6= Cypress.moment().add(1,'month').format('HH:mm DD/MM/YYYY')
   let startDateint6 = parseInt(startDate6)
   let endDatedisplayed6 = (Cypress.moment().add(2,'month').format('HH:mm DD/MM/YYYY'))
   const endDate6= parseInt(Cypress.moment().add(2,'month').format('x'))
   let dateDisplayed6= "("+ startdatedisplayed6 + " - " + endDatedisplayed6 + ")"
                   //7th Card
   
   let processInstanceId7 = "cypress-timeline-7"
   let severity7 = 'INFORMATION'
   let publisherName7 = "publisher_test"
   let processName7= "defaultProcess"
   let publisherV7= "1"
   let state7= "messageState"
   let publishDate7 = Cypress.moment().format('L LT')
   let publishDateDisplayed7 = Cypress.moment().format('HH:mm DD/MM/YYYY')
   let startDate7 = Cypress.moment().add(1,'hour').format('x')
   let startdatedisplayed7= Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY')
   let startDateint7 = parseInt(startDate7)
   let endDatedisplayed7 = (Cypress.moment().add(1,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
   const endDate7= parseInt(Cypress.moment().add(1,'hour').add(1, 'day').format('x'))
   let dateDisplayed7= "("+ startdatedisplayed7 + " - " + endDatedisplayed7 + ")"
   
   //8th Card
   let processInstanceId8 = "cypress-timeline-8"
   let severity8 = 'ACTION'
   let publisherName8 = "publisher_test"
   let processName8= "defaultProcess"
   let publisherV8= "1"
   let state8= "messageState"
   let publishDate8 = Cypress.moment().format('L LT')
   let publishDateDisplayed8 = Cypress.moment().format('HH:mm DD/MM/YYYY')
   let startDate8= Cypress.moment().add(1,'month').format('x')
   let startdatedisplayed8= Cypress.moment().add(1,'month').format('HH:mm DD/MM/YYYY')
   let startDateint8 = parseInt(startDate8)
   let endDatedisplayed8 = (Cypress.moment().add(2,'month').format('HH:mm DD/MM/YYYY'))
   const endDate8= parseInt(Cypress.moment().add(2,'month').format('x'))
   let dateDisplayed8= "("+ startdatedisplayed8 + " - " + endDatedisplayed8 + ")"

 //9th Card
   let processInstanceId9 = "cypress-timeline-9"
   let severity9 = 'ALARM'
   let publisherName9 = "publisher_test"
   let processName9= "defaultProcess"
   let publisherV9= "1"
   let state9= "messageState"
   let publishDate9= Cypress.moment().format('L LT')
   let publishDateDisplayed9 = Cypress.moment().format('HH:mm DD/MM/YYYY')
   let startDate9= Cypress.moment().add(3.5,'month').format('x')
   let startdatedisplayed9= Cypress.moment().add(3.5,'month').format('HH:mm DD/MM/YYYY')
   let startDateint9 = parseInt(startDate9)
   let endDatedisplayed9 = (Cypress.moment().add(4,'month').format('HH:mm DD/MM/YYYY'))
   const endDate9= parseInt(Cypress.moment().add(4,'month').format('x'))
   let dateDisplayed9= "("+ startdatedisplayed9 + " - " + endDatedisplayed9 + ")"


    //10th Card
    let processInstanceId10 = "cypress-timeline-10"
    let severity10 = 'COMPLIANT'
    let publisherName10 = "publisher_test"
    let processName10= "defaultProcess"
    let publisherV10= "1"
    let state10= "messageState"
    let publishDate10 = Cypress.moment().format('L LT')
    let publishDateDisplayed10 = Cypress.moment().format('HH:mm DD/MM/YYYY')
    let startDate10= Cypress.moment().add(3,'hour').format('x')
    let startdatedisplayed10= Cypress.moment().add(3,'hour').format('HH:mm DD/MM/YYYY')
    let startDateint10 = parseInt(startDate10)
    let endDatedisplayed10 = (Cypress.moment().add(5,'hour').format('HH:mm DD/MM/YYYY'))
    const endDate10= parseInt(Cypress.moment().add(5,'hour').format('x'))
    let dateDisplayed10= "("+ startdatedisplayed10 + " - " + endDatedisplayed10 + ")"





   
       it('Send cards for timeline',()=>{
       cy.LogOpFab(login, password)
       cy.waitDefaultTime()
       cy.PushCard(processName1, publisherV1, publisherName1, processInstanceId1, state1, severity1, startDateint1, endDate1)
       cy.waitDefaultTime()
       cy.PushCard(processName2, publisherV2, publisherName2, processInstanceId2, state2, severity2, startDateint2, endDate2)
       cy.waitDefaultTime()
       cy.PushCard(processName3, publisherV3, publisherName3, processInstanceId3, state3, severity3, startDateint3, endDate3)
       cy.waitDefaultTime()
       cy.PushCard(processName4, publisherV4, publisherName4, processInstanceId4, state4, severity4, startDateint4, endDate4)
       cy.waitDefaultTime()
       cy.PushCard(processName5, publisherV5, publisherName5, processInstanceId5, state5, severity5, startDateint5, endDate5)
       cy.waitDefaultTime()
       cy.PushCard(processName6, publisherV6, publisherName6, processInstanceId6, state6, severity6, startDateint6, endDate6)
       cy.waitDefaultTime()
       cy.PushCard(processName7, publisherV7, publisherName7, processInstanceId7, state7, severity7, startDateint7, endDate7)
       cy.waitDefaultTime()
       cy.PushCard(processName8, publisherV8, publisherName8, processInstanceId8, state8, severity8, startDateint8, endDate8)
       cy.waitDefaultTime()
       cy.PushCard(processName9, publisherV9, publisherName9, processInstanceId9, state9, severity9, startDateint9, endDate9)
       cy.waitDefaultTime()
       cy.PushCard(processName10, publisherV10, publisherName10, processInstanceId10, state10, severity10, startDateint10, endDate10)

       //Check real time view
       cy.get(':nth-child(12) > .ng-star-inserted > text').contains('2')
       cy.get(':nth-child(13) > .ng-star-inserted > text').contains('1')

      //Check Year view

      cy.get('#opfab-timeline-link-period-Y').click()
      cy.waitDefaultTime()

      cy.get(':nth-child(18) > .ng-star-inserted > text').contains('1')
      cy.get(':nth-child(14) > .ng-star-inserted > text').contains('1')
      cy.get(':nth-child(16) > .ng-star-inserted > text').contains('1')
      cy.get(':nth-child(12) > .ng-star-inserted > text').contains('2')
      cy.get(':nth-child(13) > .ng-star-inserted > text').contains('2')
      cy.get(':nth-child(15) > .ng-star-inserted > text').contains('1')
      cy.get(':nth-child(17) > .ng-star-inserted > text').contains('2')



       })
      })