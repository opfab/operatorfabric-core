//TODO Check that all commands are used

const ONE_SECOND = 1000;

Cypress.Commands.add('waitDefaultTime', () => {
    cy.wait(Cypress.env('defaultWaitTime'))
})

Cypress.Commands.add('PushCard', (processName, processVersion, publisherName, processId, message, severity, startDate, endDate)=>
{
    cy.request({
        method : 'POST',
        url : Cypress.env('host')+':2102/cards',
        body: {
            "publisher" : publisherName,
            "processVersion" : processVersion,
            "process"  : processName,
            "processInstanceId" : processId,
            "state": message,
            "groupRecipients": ["Dispatcher","ADMIN"],
            "severity" : severity ,
            "tags": [
                "MyAwesomeTag","MyTests","Emergency"
            ],
            "startDate" : startDate,
            "endDate" : endDate,
            "summary" : {"key" : "message.summary"},
            "title" : {"key" : "message.title"},
            "data" : {"message":"a message"}
        }
    }).then(response =>{
        cy.expect(response.status).to.eq(201);
        cy.expect(response.body).to.have.property('count', 1);

    })
})

Cypress.Commands.add('PushActionCard', (processName, processVersion, publisherName, processId, message, severity, startDate, endDate,lttd)=>
{
    cy.request({
        method : 'POST',
        url : Cypress.env('host')+':2102/cards',
        body: {
            "publisher" : publisherName,
            "processVersion" : processVersion,
            "process"  : processName,
            "processInstanceId" : processId,
            "state": message,
            "groupRecipients": ["Dispatcher","Planner","Supervisor"],
            "entitiesAllowedToRespond": ["ENTITY1","ENTITY2"],
            "severity" : severity ,
            "tags": [
                "MyAwesomeTag","MyTests","Emergency"
            ],
            "startDate" : startDate,
            "endDate" : endDate,
            "lttd" : lttd,
            "summary" : {"key" : "message.summary"},
            "title" : {"key" : "message.title"},
            "data" : {"message":"a message"}
        }
    }).then(response =>{
        cy.expect(response.status).to.eq(201);
        cy.expect(response.body).to.have.property('count', 1);

    })
})

Cypress.Commands.add('LogOpFab',(username, password)=>
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