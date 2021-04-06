// This test sends a card with a random severity and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('BasicCheck',()=>{

    let possibleSeverities= ['ALARM', 'ACTION', 'INFORMATION', 'COMPLIANT'];
    let severity = possibleSeverities[Math.floor(Math.random() * possibleSeverities.length)];
    let publisherName = "publisher_test"
    let processName= "defaultProcess"
    let publisherV = "1"
    let state = "messageState"
    let login='operator1'
    let password='test'
    let publishDate = Cypress.moment();
    let publishDateDisplayed = publishDate.format('DD/MM/YYYY')
    //TODO Find a better way to handle locale-dependant formatting
    let publishTimeDisplayedEN = publishDate.format('h:mm A')
    let publishTimeDisplayedFR = publishDate.format('HH:mm')
    let startDate = publishDate.add(1,'hour').format('x')
    let startdatedisplayed = publishDate.add(1,'hour').format('HH:mm DD/MM/YYYY')
    //Verify that it is a number otherwise cy.log(typeof startDate)
    let startDateint = parseInt(startDate)
    let endDatedisplayed = (publishDate.add(1,'hour').add(1, 'day').format('HH:mm DD/MM/YYYY'))
    const endDate = parseInt(publishDate.add(1,'hour').add(1, 'day').format('x'))
    let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
    let red = 'rgb(167, 26, 26)'
    let green = 'rgb(0, 187, 3)'
    let bleue = 'rgb(16, 116, 173)'
    let yellow = 'rgb(253, 147, 18)'
    let processInstanceId = "Cy-" + startDate
    var color ='color';

    switch(severity){
        case 'ALARM':
            color = red;
            break;
        case 'COMPLIANT':
            color = green;
            break;
        case 'INFORMATION':
            color = bleue;
            break;
        case 'ACTION':
            color = yellow;
    }

    it('login and send a card', ()=>{

        cy.log(severity)
        cy.LogOpFab(login,password)

        cy.log('publishDate '+publishDate)
        cy.log ('startDate '+startDate)
        cy.log ('endDate '+endDate)
        cy.log (startdatedisplayed)
        cy.log (endDatedisplayed)
        cy.log(color)
        cy.log(processInstanceId)

        cy.get('#opfab-feed-filter-btn-sort').click()
        cy.get('#sort-form > :nth-child(2)').click()
        cy.PushCard(processName, publisherV, publisherName, processInstanceId, state, severity, startDateint, endDate)
        cy.goToSettings()
        cy.get('#opfab-setting-locale').select('en')

        cy.goToFeed()
        cy.waitDefaultTime()
        cy.waitDefaultTime()
        // Check card created
        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' .card-subtitle').click({ force: true })

        // TODO Fix display date issues (timezones?)
        //cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' .card-subtitle').contains(dateDisplayed)
        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex;"]').contains('Message')
        cy.get('h4').contains('Hello ' + login+ ', you received the following message');
        cy.get('.opfab-menu-item-left > .opfab-tab').contains('Message')
        cy.get('.template-style').contains("a message")

        cy.get('#opfab-selected-card').contains('Message received')

        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .badge-border')
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);

        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(2) > .badge-border')
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get('.opfab-card-received-footer').contains('Received on '+publishDateDisplayed+' at '+publishTimeDisplayedEN)
        cy.get('#opfab-card-details-btn-ack').contains('ACKNOWLEDGE AND CLOSE')
        cy.log('card checked')
        cy.waitDefaultTime()


        cy.goToSettings()
        cy.get('#opfab-setting-locale').select('fr')
        cy.waitDefaultTime()
        cy.goToFeed()

        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex; width: 100%; margin-top: 5px;"] > .card-subtitle').click({ force: true })
        //cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex; width: 100%; margin-top: 5px;"] > .card-subtitle').contains(dateDisplayed)
        //cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+'> :nth-child(1) > .p-1 > [style="display: flex;"]').contains('Message')
        cy.get('h4').contains('Bonjour ' + login+ ', vous avez reçu le message suivant');
        cy.get('.opfab-menu-item-left > .opfab-tab').contains('Message')
        cy.get('.template-style').contains("a message")

        cy.get('#opfab-selected-card').contains('Message reçu')

        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .badge-border')
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);

        cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(2) > .badge-border')
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get('.opfab-card-received-footer').contains('Reçu le '+publishDateDisplayed+' à '+publishTimeDisplayedFR)
        cy.get('#opfab-card-details-btn-ack').contains('ACQUITTER ET FERMER')
        cy.log('card checked')

    })


})
