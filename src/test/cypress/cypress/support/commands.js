
Cypress.Commands.add('waitDefaultTime', () => {
    cy.wait(Cypress.env('defaultWaitTime'))
})

Cypress.Commands.add('loginOpFab',(username, password)=>
{   //go to login page
    cy.visit('')

    //type login
    cy.get('#opfab-login').should('be.visible')
    cy.get('#opfab-login').type(username)

    //type password
    cy.get('#opfab-password').should('be.visible')
    cy.get('#opfab-password').type(password)

    //press login button
    cy.get('#opfab-login-btn-submit').click()
    cy.get('#opfab-login-btn-submit').should('be.visible')

    //Wait for the app to finish initializing
    cy.get('#cypress-loaded-check', {timeout: 10000}).should('have.text', 'true');
})

Cypress.Commands.add('loadTestConf', () => {
    // This clears existing processGroups, bundles and perimeters and load the test configuration
    cy.exec('cd .. && ./resources/loadTestConf.sh '+Cypress.env('host'));
})

Cypress.Commands.add('sendTestCards', () => {
    cy.exec('cd .. && ./resources/send6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('sendCard', (cardFile) => {
    cy.exec('cd ../resources/cards/ && ./sendCard.sh '+ cardFile + ' ' + Cypress.env('host'));
})


Cypress.Commands.add('deleteTestCards', () => {
    cy.exec('cd .. && ./resources/delete6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('deleteCard', (cardId) => {
    cy.exec('cd ../resources/cards/ && ./deleteCard.sh '+ cardId + ' ' + Cypress.env('host'));
})
