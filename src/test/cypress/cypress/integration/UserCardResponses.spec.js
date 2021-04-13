describe ('UserCardResponses',()=>{
//check the current language

// In this test the card will be sent to the following groups Dispatcher,Planner, Supervisor
// The entities Allowed To Respond are control room 1 & control room 2 ()
// operator 1 & 3 can anwser the card on behalf of entity 1
// operator 2 can anwser the card on behalf of entity 2
//operator 4 will have only the right to read the card


    let login='operator1'
    let login2='operator2'
    let login3='operator3'
    let login4='operator4'

    let password='test'

    let orange='rgb(253, 147, 19)'
    let darkOrange='rgb(255, 102, 0)'
    let grey='rgb(186, 186, 186)'
    let white='rgb(255, 255, 255)'
    let green='rgb(0, 128, 0)'
    let bleue='rgb(39, 132, 255)'

//ENTUTY ALLOWDED TO RESPONSE

    let entity1= "Control Room 1"
    let entity2= "Control Room 2"

    //First Card
    let processInstanceId1 = "cypress-test-Action-1"
    let severity1 = 'ACTION'
    let publisherName1 = "processAction"
    let processName1= "defaultProcess"
    let publisherV1 = "1"
    let state1 = "questionState"
    let publishDate1 = Cypress.moment().format('L LT')
    let publishDateDisplayed1 = Cypress.moment().format('HH:mm DD/MM/YYYY')
    let startDate1 = Cypress.moment().add(2,'hour').format('x')
    let startdatedisplayed1 = Cypress.moment().add(2,'hour').format('HH:mm DD/MM/YYYY')

    let startDateint1 = parseInt(startDate1)
    let endDatedisplayed1 = (Cypress.moment().add(2,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
    const endDate1= parseInt(Cypress.moment().add(2,'hour').add(1, 'day').format('x'))
    let dateDisplayed1= "("+ startdatedisplayed1 + " - " + endDatedisplayed1 + ")"
    let lttd=parseInt(Cypress.moment().add(2,'hour').add(1, 'day').format('x'))


    //Second  Card
    //expired lttd
    let processInstanceId2 = "cypress-test-Action-2"
    let severity2 = 'ALARM'
    let publisherName2 = "processAction"
    let processName2= "defaultProcess"
    let publisherV2 = "1"
    let state2 = "questionState"
    let publishDate2 = Cypress.moment().format('L LT')
    let publishDateDisplayed2 = Cypress.moment().format('HH:mm DD/MM/YYYY')
    let startDate2 = Cypress.moment().add(1,'hour').format('x')
    let startdatedisplayed2 = Cypress.moment().add(1,'hour').format('HH:mm DD/MM/YYYY')

    let startDateint2 = parseInt(startDate2)
    let endDatedisplayed2 = (Cypress.moment().add(1,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
    const endDate2= parseInt(Cypress.moment().add(1,'hour').add(1, 'day').format('x'))
    let dateDisplayed2= "("+ startdatedisplayed2 + " - " + endDatedisplayed2 + ")"
    let lttd2=parseInt(Cypress.moment().add(4,'second').format('x'))



    //Confirmation Message while creating a new card

    let confirmationFr='Votre réponse est confirmée. Merci!'
    let confirmationEn='Your answer is confirmed. Thank you!'


    // Validation button label

    let validationLabelFr='VALIDER REPONSE'
    let validationLabelEn='VALIDATE ANSWER'
    let modificationLabelFr='MODIFIER REPONSE'
    let modificationLabelEn='MODIFY ANSWER'



    it('Set current language Fr, Send a card to operator 1 and 2 and verify for operator1 ',()=>{
    cy.LogOpFab(login, password)
    cy.waitDefaultTime()
    cy.goToSettings()
    cy.get('#opfab-setting-locale').select('fr')
    cy.waitDefaultTime()
    cy.goToFeed()
    cy.PushActionCard(processName1, publisherV1, publisherName1, processInstanceId1, state1, severity1, startDateint1, endDate1,lttd)
    cy.waitDefaultTime()

    cy.get('#opfab-feed-light-card-'+processName1+'-'+processInstanceId1+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })

    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > [translate=""]').contains("Réponses")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(4)').contains(entity2)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('#opfab-card-details-btn-response').contains(validationLabelFr)
    cy.should('be.visible')
    cy.should('have.css', 'color',white)

    cy.get('.opfab-card-received-footer')
    cy.should('be.visible')
    cy.should('have.css', 'color',grey)

    cy.log('Card checked for '+ login)

    cy.waitDefaultTime()


})

it('Set current language En, verify previous card for operator2',()=>{
    cy.LogOpFab(login2, password)
    cy.goToSettings()
    cy.get('#opfab-setting-locale').select('en')
    cy.waitDefaultTime()
    cy.goToFeed()
    cy.get('#opfab-feed-light-card-'+processName1+'-'+processInstanceId1+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })

    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action required")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > [translate=""]').contains("Answers")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(4)').contains(entity2)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('#opfab-card-details-btn-response').contains(validationLabelEn)
    cy.should('be.visible')
    cy.should('have.css', 'color',white)



    cy.get('.opfab-card-received-footer')
    cy.should('be.visible')
    cy.should('have.css', 'color',grey)

    //Answer the card

    cy.get(':nth-child(5) > .opfab-checkbox-checkmark').click()
    cy.get('#opfab-card-details-btn-response').click()

    //check confirmation message and close
    cy.get('#div-detail-msg > .ng-star-inserted').contains(confirmationEn)
    cy.should('be.visible')
    cy.should('have.css', 'background-color','rgba(0, 0, 0, 0)')
    cy.should('have.css', 'color',white)

    cy.get('#div-detail-msg').click()
    cy.waitDefaultTime()

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(4)').contains(entity2)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)


    cy.get('#opfab-card-details-btn-response').contains('MODIFY ANSWER')
    cy.should('be.visible')
    cy.should('have.css', 'background-color',bleue)
    cy.should('have.css', 'color',white)

    cy.log('Card checked for '+ login2)

    cy.waitDefaultTime()


    //check card content

    cy.get('center > h4').contains("Responses received")
    cy.get('tbody > :nth-child(1) > :nth-child(1)').contains('Entity')
    cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('10/08/2020 8AM-10AM')
    cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('10/08/2020 10AM-12PM')
    cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('11/08/2020 8AM-10AM')

    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(entity2)
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('NOK')

})


it('log in with operator 1, check last card update, and answer on behalf of control room 1',()=>{


    //login has to belong to Control room 1
    cy.LogOpFab(login,password)
    cy.goToSettings()
    cy.get('#opfab-setting-locale').select('fr')
    cy.waitDefaultTime()
    cy.goToFeed()
    cy.get('#opfab-feed-light-card-'+processName1+'-'+processInstanceId1+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })

    //Check card content
    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > [translate=""]').contains('Réponses')
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)


    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',darkOrange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(4)').contains(entity2)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)


    cy.get('#opfab-card-details-btn-response').contains(validationLabelFr)
    cy.should('be.visible')
    cy.should('have.css', 'color',white)



    cy.get('.opfab-card-received-footer')
    cy.should('be.visible')
    cy.should('have.css', 'color',grey)

    //Answer the question
    cy.get(':nth-child(5) > .opfab-checkbox-checkmark').click()
    cy.get(':nth-child(7) > .opfab-checkbox-checkmark').click()
    cy.get('#opfab-card-details-btn-response').click()

    //check confirmation message and close
    cy.get('#div-detail-msg > .ng-star-inserted').contains(confirmationFr)
    cy.should('be.visible')
    cy.should('have.css', 'background-color','rgba(0, 0, 0, 0)')
    cy.should('have.css', 'color',white)

    cy.get('#div-detail-msg').click()


    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

    cy.get('#opfab-card-details-btn-response').contains(modificationLabelFr)
    cy.should('be.visible')
    cy.should('have.css', 'background-color',bleue)
    cy.should('have.css', 'color',white)

    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)
    //check card content

    cy.get('.form-group > h4').contains('Indisponibilité de 2 heures à prevoir pour la ligne HVDC France-Angleterre')

    // to be corrected
    cy.get('center > h4').contains("Responses reçues")
    cy.get('tbody > :nth-child(1) > :nth-child(1)').contains('Entity')
    cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('10/08/2020 8h-10h')
    cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('10/08/2020 10h-12h')
    cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('11/08/2020 8h-10h')

    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(entity2)
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('NOK')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains(entity1)
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(3) > :nth-child(4)').contains('OK')

})

it('log in with operator3, check last card update, and modify the answer on behalf of control room 1',()=>{


    cy.LogOpFab(login3, password)
    cy.waitDefaultTime()
    cy.goToSettings()
    cy.get('#opfab-setting-locale').select('fr')

    cy.waitDefaultTime()
    cy.goToFeed()

    cy.waitDefaultTime()

    cy.get('#opfab-feed-light-card-'+processName1+'-'+processInstanceId1+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })


    //check card content

    cy.get('.form-group > h4').contains('Indisponibilité de 2 heures à prevoir pour la ligne HVDC France-Angleterre')
    //cy.get('.form-group > :nth-child(5)').contains('Le 10/08/2020 entre 8h et 10h')
   // cy.get('.form-group > :nth-child(6)').contains('Le 10/08/2020 entre 10h et 12h')
    //cy.get('.form-group > :nth-child(7)').contains('Le 11/08/2020 entre 8h et 10h')

    // to be corrected
    cy.get('center > h4').contains("Responses reçues")
    cy.get('tbody > :nth-child(1) > :nth-child(1)').contains('Entity')
    cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('10/08/2020 8h-10h')
    cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('10/08/2020 10h-12h')
    cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('11/08/2020 8h-10h')

    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(entity2)
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('NOK')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains(entity1)
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(3) > :nth-child(4)').contains('OK')


    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)



    // full size card

    cy.get('.opfab-menu-icon').click()

    //modify card response
    cy.get('#opfab-card-details-btn-response').contains(modificationLabelFr).click()
    cy.get(':nth-child(6) > .opfab-checkbox-checkmark').click()

    //validate the modification
    cy.get('#opfab-card-details-btn-response').click()

    cy.log('modification made')

        //check confirmation message and close
        cy.get('#div-detail-msg > .ng-star-inserted').contains(confirmationFr)
        cy.should('be.visible')
        cy.should('have.css', 'background-color','rgba(0, 0, 0, 0)')
        cy.should('have.css', 'color',white)

    //recheck card content
    cy.get('center > h4').contains("Responses reçues")
    cy.get('tbody > :nth-child(1) > :nth-child(1)').contains('Entity')
    cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('10/08/2020 8h-10h')
    cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('10/08/2020 10h-12h')
    cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('11/08/2020 8h-10h')

    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(entity2)
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('NOK')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains(entity1)
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('NOK')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('OK')
    cy.get('tbody > :nth-child(3) > :nth-child(4)').contains('NOK')


    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)



    cy.get('.opfab-max-and-reduce-icons').click()
    cy.get('.opfab-close-card-link > span').click()


})


it('log in with operator4 , check last card update, verify that he can\'t modify the card',()=>{

    cy.LogOpFab(login4, password)
    cy.waitDefaultTime()
    cy.goToSettings()

    cy.get('#opfab-setting-locale').select('fr')
    cy.waitDefaultTime()
    cy.goToFeed()


    cy.waitDefaultTime()

    cy.get('#opfab-feed-light-card-'+processName1+'-'+processInstanceId1+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })


    //check card content

    cy.get('.form-group > h4').contains('Indisponibilité de 2 heures à prevoir pour la ligne HVDC France-Angleterre')


    cy.get('center > h4').contains("Responses reçues")
    cy.get('tbody > :nth-child(1) > :nth-child(1)').contains('Entity')
    cy.get('tbody > :nth-child(1) > :nth-child(2)').contains('10/08/2020 8h-10h')
    cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('10/08/2020 10h-12h')
    cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('11/08/2020 8h-10h')

    cy.get('tbody > :nth-child(2) > :nth-child(1)').contains(entity2)
    cy.get('tbody > :nth-child(2) > :nth-child(2)').contains('OK')
    cy.get('tbody > :nth-child(2) > :nth-child(3)').contains('NOK')
    cy.get('tbody > :nth-child(2) > :nth-child(4)').contains('NOK')

    cy.get('tbody > :nth-child(3) > :nth-child(1)').contains(entity1)
    cy.get('tbody > :nth-child(3) > :nth-child(2)').contains('NOK')
    cy.get('tbody > :nth-child(3) > :nth-child(3)').contains('OK')
    cy.get('tbody > :nth-child(3) > :nth-child(4)').contains('NOK')


    cy.get('[style="padding-left: 15px;"]').contains("Status")
    cy.should('be.visible')
    cy.should('have.css', 'color', grey)

    cy.get('.opfab-question-card-state-name').contains("Action requise")
    cy.should('be.visible')
    cy.should('have.css', 'color',orange)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

    cy.get('[style="width: 70%; text-align: right;"] > :nth-child(3)').contains(entity1)
    cy.should('be.visible')
    cy.should('have.css', 'color',green)

        //check that other buttons are not displayed

    cy.contains(validationLabelEn).should('not.exist')
    cy.contains(validationLabelFr).should('not.exist')
    cy.contains(modificationLabelEn).should('not.exist')
    cy.contains(modificationLabelFr).should('not.exist')

    cy.log('action button are not displayed')

    //ack and close

    cy.get('#opfab-card-details-btn-ack').contains('ACQUITTER ET FERMER')
    cy.should('be.visible')
    cy.get('#opfab-card-details-btn-ack').click()
})
it('Send a card that is about to expire and verify that the validation buttons are disabled',()=>{


    //login has to belong to Control room 1
    cy.LogOpFab(login,password)
    cy.waitDefaultTime()
    //Send an expired card
    cy.PushActionCard(processName2, publisherV2, publisherName2, processInstanceId2, state2, severity2, startDateint2, endDate2,lttd2)
    cy.waitDefaultTime()

    //Check the card specially that the button to validate the answer is disabled
    cy.get('#opfab-feed-light-card-'+processName2+'-'+processInstanceId2+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })

    cy.get('#opfab-card-details-btn-response').contains(validationLabelFr)
    cy.get('#opfab-card-details-btn-response').should('be.disabled')
    cy.get('#opfab-card-details-btn-response').should('be.visible')
    cy.should('have.css', 'background-color','rgb(43, 53, 63)')
    cy.get('#opfab-feed-light-card-'+processName2+'-'+processInstanceId2+' .lttd-text').contains('Terminée')

})
it('verify that the validation button is disabled for entity 2 as well',()=>{


    //login has to belong to Control room 2
    cy.LogOpFab(login2,password)
    cy.waitDefaultTime()

    cy.get('#opfab-feed-light-card-'+processName2+'-'+processInstanceId2+' :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title') .click({ force: true })
    cy.get('#opfab-card-details-btn-response').should('be.disabled')
    cy.get('#opfab-card-details-btn-response').contains(validationLabelEn)
    cy.get('#opfab-card-details-btn-response').should('be.visible')
    cy.should('have.css', 'background-color','rgb(43, 53, 63)')

    //light card check that it displays "finshed"
    cy.get('#opfab-feed-light-card-'+processName2+'-'+processInstanceId2+' .lttd-text').contains('Finished')

})
})