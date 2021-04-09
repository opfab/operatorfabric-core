let OpFabUrlCards="http://localhost:2102/cards"
let OpFafUrlToken="http://localhost:89/auth/token"
let OpFafUrlAuth="http://localhost:2002/ui/#/"
let OpFafUrlLang="http://localhost:80/users/users/"
//TODO Have these url rely on baseUrl or move to separate config file

//TODO Check that all commands are used


const ONE_SECOND = 1000;

Cypress.Commands.add('waitDefaultTime', () => {
    cy.wait(Cypress.env('defaultWaitTime'))
})

Cypress.Commands.add('PushCard', (processName, processVersion, publisherName, processId, message, severity, startDate, endDate)=>
{
    cy.request({
        method : 'POST',
        url : OpFabUrlCards,
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
        url : OpFabUrlCards,
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

//TODO opfab-client should be configurable?a
Cypress.Commands.add('getToken', (username,password) => {
    cy.request({
            method: 'POST',
            url: 'http://localhost:2002/auth/token',
            form: true,
            body: {
                username: username,
                password: password,
                grant_type: 'password',
                client_id: 'opfab-client'
            }
        }
    ).its('body').as('getTokenResponse')
})

//TODO Are there other things that are set up in localstorage or session as part of logging in (keycloak cookies?)
//TODO token url should be variable
//TODO Handle other authentication modes?
Cypress.Commands.add('visitWithToken', (url) => {
    cy.visit(url,{
        onBeforeLoad (window) {
            // and before the page finishes loading
            // set the user object in local storage
            window.localStorage.setItem('identifier', this.getTokenResponse.identifier);
            window.localStorage.setItem('token', this.getTokenResponse.access_token);
            window.localStorage.setItem('expirationDate', Date.now() + ONE_SECOND * this.getTokenResponse.expires_in);
            window.localStorage.setItem('clientId', 1); //TODO See if we need to do something more complicated
        },
    })
})

Cypress.Commands.add('LogOpFab',(username, password)=>
{   //go to login page
    cy.visit(OpFafUrlAuth)

    //type login
    cy.get('#opfab-login').should('be.visible')
    cy.get('#opfab-login').type(username)

    //type password
    cy.get('#opfab-password').should('be.visible')
    cy.get('#opfab-password').type(password)

    //press login button
    cy.get('#opfab-login-btn-submit').click()
    cy.get('#opfab-login-btn-submit').should('be.visible')

    //if keycloack
    //cy.get('#username').type(username);
    //cy.get('#password').type(password);
    //cy.get('#kc-login').click();
})

Cypress.Commands.add('checkCardContent', (processName,processInstanceId,cardTitle,dateDisplayed,color,detailsFirst,detailsSecond,cardSummmary)=>
{
    //check card title
    cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title').click()
    cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .p-1 > [style="display: flex;"] > .card-title').contains(cardTitle)
    cy.should('be.visible')
    //check card's business period
    cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .p-1 > [style="display: flex; width: 100%; margin-top: 5px;"] > .card-subtitle').contains(dateDisplayed)
    cy.should('be.visible')
    //Check card summary
    cy.get('#opfab-selected-card').contains(cardSummmary)
    cy.should('be.visible')
    //check card details

    cy.get('.opfab-menu-item-left > .opfab-tab').contains(cardTitle)
    cy.should('be.visible')
    cy.get('h4').contains(detailsFirst);

    cy.should('be.visible')
    cy.get('.template-style').contains(detailsSecond)
    cy.should('be.visible')

    //check card severity color
    cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(1) > .badge-border')
    cy.should('be.visible');
    cy.should('have.css', 'background-color',color);

    cy.get('#opfab-feed-light-card-'+processName+'-'+processInstanceId+' > :nth-child(2) > .badge-border')
    cy.should('be.visible');
    cy.should('have.css', 'background-color',color)
})

Cypress.Commands.add('goToArchives', ()=>
{
    cy.get('#opfab-navbar-menu-archives').click()
})

Cypress.Commands.add('goToFeed', ()=>
{
    cy.get('#opfab-navbar-menu-feed').click()
})

Cypress.Commands.add('goToSettings', ()=>
{
    cy.get('#opfab-navbar-drop_user_menu').click()
    cy.get('#opfab-navbar-right-menu-settings > [translate=""]').click()

})
Cypress.Commands.add('goToAbout', ()=>
{
    cy.get('#opfab-navbar-drop_user_menu').click()
    cy.get('a[routerlink="/about"]').click();
})

Cypress.Commands.add('getLang', (user,password)=>
{
    let token;
    let lang;
    cy.request({
        method : 'POST',
        url : OpFafUrlToken,
        form : true,
        body: {
            'username' : user,
            'password' : password,
            'grant_type' : 'password',
            'client_id' : 'opfab-client',
            'secret' : 'opfab-keycloack-secret'
        }
    }).then(response =>{
        token = response.body.access_token;
        cy.log(token)
        cy.request({
            method : 'GET',
            url : OpFafUrlLang+user+"/settings",
            failOnStatusCode: false,
            auth: {
                'bearer': token
            }
        }).then(response =>{
            lang = response.body.locale;
            expect(response.status).to.eql(200);
        }).then(response =>{
            return lang;
        })
    })
})



Cypress.Commands.add('ChangeLang', (currentLanguage,user,password)=>
{
    let token;
    let lang;
    if (currentLanguage === 'en') {
        lang ='fr'
    }
    else {
        lang ='en'
    }
    cy.request({
        method : 'POST',
        url : OpFafUrlToken,
        //failOnStatusCode: false,
        form : true,
        body: {
            'username' : user,
            'password' : password,
            'grant_type' : 'password',
            'client_id' : 'opfab-client',
            'secret' : 'opfab-keycloack-secret'
        }
    }).then(response =>{
        token = response.body.access_token;
        cy.request({
            method : 'PUT',
            url : 'http://localhost:80/users/users/tso1-operator/settings',
            failOnStatusCode: false,
            auth: {
                'bearer': token
            },
            body: {
                'login' : user,
                'locale' : lang
            }
        }).then(response =>{
            lang = response.body.locale;
            expect(response.status).to.eql(200);
            cy.log(lang);
        })
    })})

Cypress.Commands.add('checkArchivedCard', (user,lang,color,dateDisplayed)=>
{
    if (lang ==='en') {
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
        cy.get('h2').contains('Hello '+user+', you received the following message ');
        cy.get('.nav > .nav-item > .nav-link').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
    }
    else {
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
        cy.get('h2').contains('Bonjour '+user+', vous avez reçu le message suivant');
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message reçu')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
    }
})



Cypress.Commands.add('checkMenus',(lang)=>
{
    if(lang === 'fr')
    {
        cy.goToFeed();
        cy.get('.mr-auto > :nth-child(1) > .nav-link').contains('Flux de cartes').should('be.visible')
        cy.log("Feed menu checked")
        cy.get('.mr-auto > :nth-child(2) > .nav-link').contains('Création de cartes').should('be.visible')
        cy.log("Card creation checked")
        cy.get('.mr-auto > :nth-child(3) > .nav-link').contains('Archives').should('be.visible')
        cy.log("Archives MENU  checked")
        cy.get('.mr-auto > :nth-child(4) > .nav-link').contains('Monitoring').should('be.visible')
        cy.log("Monitoring menu  checked")
        cy.get('.mr-auto > :nth-child(5) > .nav-link').contains('Logging').should('be.visible')
        cy.log("Logging menu checked")
        cy.get('.mr-auto > :nth-child(6) > .nav-link').contains('Calendrier').should('be.visible')
        cy.log("Archives menu checked")
    }else{
        cy.goToFeed();
        cy.get('.mr-auto > :nth-child(1) > .nav-link').contains('Card Feed').should('be.visible')
        cy.log("Feed menu checked")
        cy.get('.mr-auto > :nth-child(2) > .nav-link').contains('Card Creation').should('be.visible')
        cy.log("Card creation checked")
        cy.get('.mr-auto > :nth-child(3) > .nav-link').contains('Archives').should('be.visible')
        cy.log("Archives MENU  checked")
        cy.get('.mr-auto > :nth-child(4) > .nav-link').contains('Monitoring').should('be.visible')
        cy.log("Monitoring menu  checked")
        cy.get('.mr-auto > :nth-child(5) > .nav-link').contains('Logging').should('be.visible')
        cy.log("Logging  menu  checked")
        cy.get('.mr-auto > :nth-child(6) > .nav-link').contains('Calendar').should('be.visible')
        cy.log("Calendar menu  checked")
    }
})
Cypress.Commands.add('changeLangManually',(lang)=>
{
    if (lang=='fr'){
        cy.get('#opfab-setting-locale').click();
        cy.get('select').eq(0).select('en')
        lang='en'
    } else {
        cy.get('#opfab-setting-locale').click();
        cy.get('select').eq(0).select('fr');
        lang='fr';
    }
})

Cypress.Commands.add('checkFeed', (user,lang,color,dateDisplayed)=>
{
    if (lang ==='en') {
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
        cy.get('h2').contains('Hello '+user+', you received the following message');
        cy.get('#div-detail-btn > .btn').contains('Acknowledge and close')
        cy.get('.nav > .nav-item > .nav-link').contains('Message');//cy.get('.nav > .nav-item > .nav-link')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
    }else{
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
        cy.get('h2').contains('Bonjour '+user+', vous avez reçu le message suivant');
        cy.get('#div-detail-btn > .btn').contains('Acquitter et fermer')
        cy.get('.nav > .nav-item > .nav-link').contains('Message');//cy.get('.nav > .nav-item > .nav-link')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message reçu')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border');
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
    }
})
Cypress.Commands.add('goToFeedSeverityFilter', ()=>
    cy.get('of-type-filter > .btn').click()
)

Cypress.Commands.add('checkFeedSeverityFilter', (lang)=>
    {
        if (lang ==='en') {

            cy.get('.popover-header > span').contains('Type').should('be.visible')//check title

            cy.get(':nth-child(1) > .form-check-label').contains('Alarm').should('be.visible')
            cy.get(':nth-child(2) > .form-check-label').contains('Action').should('be.visible')
            cy.get(':nth-child(3) > .form-check-label').contains('Compliant').should('be.visible')
            cy.get(':nth-child(4) > .form-check-label').contains('Information').should('be.visible')
        } else {
            cy.get('.popover-header > span').contains('Type').should('be.visible')//check title
            cy.get(':nth-child(1) > .form-check-label').contains('Alarme').should('be.visible')
            cy.get(':nth-child(2) > .form-check-label').contains('Action').should('be.visible')
            cy.get(':nth-child(3) > .form-check-label').contains('Conforme').should('be.visible')
            cy.get(':nth-child(4) > .form-check-label').contains('Information').should('be.visible')
        }}
)
Cypress.Commands.add('goToFeedTimeFilter', ()=>
{ cy.get('of-time-filter > .btn').click()
})

Cypress.Commands.add('checkFeedTimeFilter', (lang)=>
{
    if (lang ==='fr') {
        cy.get('.popover-header > .ng-star-inserted').contains('Date de réception').should('be.visible')
        cy.get('#start > label').contains('Début').should('be.visible')
        cy.get('#end > label').contains('Fin').should('be.visible')
        cy.get('[style="text-align:center"] > :nth-child(1)').contains('Effacer').should('be.visible')
        cy.get('#confirm_button').contains('OK').should('be.visible')
    }else{
        cy.get('.popover-header > .ng-star-inserted').contains('Receipt date').should('be.visible')
        cy.get('#start > label').contains('Start').should('be.visible')
        cy.get('#end > label').contains('End').should('be.visible')
        cy.get('[style="text-align:center"] > :nth-child(1)').contains('Reset').should('be.visible')
        cy.get('#confirm_button').contains('OK').should('be.visible')
    }
})

Cypress.Commands.add('checkDarkMode', ()=>
{
    cy.get('.opfab-colors')
    cy.should('be.visible')
    cy.should('have.css', 'background-color','rgb(52, 58, 64)')
})

Cypress.Commands.add('checkDayMode', ()=>
{
    cy.get('.opfab-colors')
    cy.should('be.visible')
    cy.should('have.css', 'background-color','rgb(255, 255, 255)')

})


Cypress.Commands.add('removeCard', (id)=>
{
    cy.request({
        method : 'DELETE',
        url : OpFabUrlCards+ id,
    }).then(response =>{
        cy.expect(response.status).to.eq(200);
        cy.log(response)
    })
})

