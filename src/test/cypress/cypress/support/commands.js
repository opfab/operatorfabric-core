// ***********************************************
// 
// 
// 
//
// 
// 
// 
// ***********************************************

let OpFabUrlCards="http://52.143.149.242:2102/cards"
let OpFafUrlToken="http://52.143.149.242:80/auth/token"
let OpFafUrlAuth="http://52.143.149.242/ui/#/"
let OpFafUrlLang="http://52.143.149.242:80/users/users/"
//let OpFafUrlAuth="http://52.143.149.242:89/auth/realms/dev/protocol/openid-connect/auth?response_type=code&client_id=opfab-client&redirect_uri=http://52.143.149.242:2002/ui/"


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
                "groupRecipients": ["Dispatcher"],
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
                cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
 
                })
        })
        Cypress.Commands.add('LogOpFab',(username, password)=>
        {
            cy.visit(OpFafUrlAuth);
            cy.get('[formcontrolname="identifier"]').type(username);
            cy.get(':nth-child(3) > .form-control').type(password);
            cy.get('#login').click();

            //if keycloack
            //cy.get('#username').type(username);
            //cy.get('#password').type(password);
            //cy.get('#kc-login').click();
        })
                Cypress.Commands.add('goToTimelineRT', ()=>
                {//timeline RT view
                    cy.get(':nth-child(3) > .btn-unselect').click();
                                })
                Cypress.Commands.add('goToTimelineD', ()=>
             {//timeline D view
                cy.get(':nth-child(4) > .btn-unselect').click()
                      })
 
             Cypress.Commands.add('goToTimelineSD', ()=>
             {//timeline 7D view
                cy.get(':nth-child(5) > .btn-unselect').click();
                                                })
             Cypress.Commands.add('goToTimelineW', ()=>
             {
                 //timeline W view
                 cy.get(':nth-child(6) > .btn-unselect').click();
             })
 
            Cypress.Commands.add('goToTimelineM', ()=>
             {
                 //timeline M view
                 cy.get(':nth-child(7) > .btn-unselect').click();
        })
            Cypress.Commands.add('goToTimelineY', ()=>
            {
                //timeline Y view
                cy.get(':nth-child(8) > .btn-unselect').click();
        })                          
 
        Cypress.Commands.add('nextButton', ()=>
            {
                //click on>> button
                cy.get(':nth-child(9) > .circle-btn > .fas').click();
        })                          
        Cypress.Commands.add('previousButton', ()=>
            {
                //click on << button
                cy.get('[style="margin-right: 1rem;"] > .circle-btn').click();
        })                          
 
        Cypress.Commands.add('homeButton', ()=>
            {
                //click on home button
                cy.get('.home-btn').click();
        })                          
        Cypress.Commands.add('timelineRTChekMinutes', ()=>
            {
                //click on home button
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(0,10)"] > text').contains('00');
                cy.get('[transform="translate(17.854166666666664,10)"] > text').contains('15');
                cy.get('[transform="translate(35.70833333333333,10)"] > text').contains('30');
                cy.get('[transform="translate(53.5625,10)"] > text').contains('45');
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(71.41666666666666,10)"] > text').contains('00');
                cy.get('[transform="translate(89.27083333333334,10)"] > text').contains('15');
                cy.get('[transform="translate(107.125,10)"] > text').contains('30');
                cy.get('[transform="translate(124.97916666666667,10)"] > text').contains('45');
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(142.83333333333331,10)"] > text').contains('00');
                cy.get('[transform="translate(160.6875,10)"] > text').contains('15');
                cy.get('[transform="translate(178.54166666666669,10)"] > text').contains('30');
                cy.get('[transform="translate(196.39583333333331,10)"] > text').contains('45');
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(214.25,10)"] > text').contains('00');
                cy.get('[transform="translate(232.10416666666666,10)"] > text').contains('15');
                cy.get('[transform="translate(249.95833333333334,10)"] > text').contains('30');
                cy.get('[transform="translate(267.8125,10)"] > text').contains('45');
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(285.66666666666663,10)"] > text').contains('00');
                cy.get('[transform="translate(303.52083333333337,10)"] > text').contains('15');
                cy.get('[transform="translate(321.375,10)"] > text').contains('30');
                cy.get('[transform="translate(339.22916666666663,10)"] > text').contains('45');
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(357.08333333333337,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(428.5,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(499.9166666666667,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(571.3333333333333,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(642.75,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(714.1666666666667,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(785.5833333333333,10)"] > text').contains('00');
               
                cy.get('.x > [ngx-charts-x-axis-ticks=""] > :nth-child(1) > [transform="translate(857,10)"] > text').contains('00');
        })                          
 
        Cypress.Commands.add('goToArchives', ()=>
        {
            cy.get(':nth-child(3) > .nav-link').click();
        })
 
        Cypress.Commands.add('goToFeed', ()=>
        {
            cy.get('.mr-auto > :nth-child(1) > .nav-link').click();
        })
 
        Cypress.Commands.add('goToSettings', ()=>
        {
            cy.get('a[id="drop_user_menu"]').click()
            cy.get('.dropdown-menu > :nth-child(1) > .nav-link').click({force: true});
 
        })
        Cypress.Commands.add('goToAbout', ()=>
        {
            cy.get('a[id="drop_user_menu"]').click()
            cy.get('a[routerlink="/about"]').click();
        })
 
        Cypress.Commands.add('getToken', (user,password)=>
        { cy.log(user)
            let token;
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
                return token
                });
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
 
            Cypress.Commands.add('checkSettingsTranslation', (lang)=>
            {
                if (lang ==='fr'){
            cy.get(':nth-child(1) > of-list-setting > form.ng-untouched > .form-group > label').contains('Langue').should('be.visible')
            cy.get('of-list-setting > form.ng-pristine > .form-group > label').contains('Zone horaire').should('be.visible')
            cy.get('#time-filter-form > .form-group > label').contains("Tags par défaut").should('be.visible')
            cy.get(':nth-child(4) > :nth-child(1) > label').contains('Jouer des sons pour les cartes de type').should('be.visible');
            cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Alarme')
            cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Action')
            cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Conforme')
            cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Information')
            cy.log("Tout les champs ont été vérifiés//All fields have been verified")
                }          
                else { //english
                    cy.get(':nth-child(1) > of-list-setting > form.ng-untouched > .form-group > label').contains('Language').should('be.visible')
                    cy.get('of-list-setting > form.ng-pristine > .form-group > label').contains('Time zone').should('be.visible')
                    cy.get('#time-filter-form > .form-group > label').contains("Default tags").should('be.visible')
                    cy.get(':nth-child(4) > :nth-child(1) > label').contains('Play sounds for cards with severity').should('be.visible');
                    cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Alarm').should('be.visible')
                    cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Action').should('be.visible')
                    cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Compliant').should('be.visible')
                    cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Information').should('be.visible')
                    cy.log("Tout les champs ont été vérifiés//All fields have been verified")
                }
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
                        url : 'http://52.143.149.242:80/users/users/tso1-operator/settings',
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
 
Cypress.Commands.add('checkArchivesLabels', (lang)=>
    {
        cy.log(lang)
        if( lang === 'en' )
        {         
         cy.get(':nth-child(1) > of-multi-filter > .form-group > label').contains('Tags').should('be.visible');
         cy.get(':nth-child(2) > of-multi-filter > .form-group > label').contains('Process').should('be.visible');
         cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish From').should('be.visible');
         cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish To').should('be.visible');
         cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active From').should('be.visible');
         cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active To').should('be.visible');
        }  
        else
        {
          cy.get(':nth-child(1) > of-multi-filter > .form-group > label').contains('Etiquettes').should('be.visible')
          cy.get(':nth-child(2) > of-multi-filter > .form-group > label').contains('Processus').should('be.visible');
          cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publié à partir de').should('be.visible');
          cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publié jusqu\'à').should('be.visible');
          cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active à partir de').should('be.visible');
          cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active jusqu\'à').should('be.visible');
        }
    })
 
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
 
    //command to check if the timelin's labels are correctly displayed and translated
    Cypress.Commands.add('checkTimelineButtons',(lang)=>
    {
        if (lang === 'fr'){
            //if the current language is french
            cy.log(lang)
            cy.get(':nth-child(3) > .btn-selected').contains('TR').should('be.visible') ;
            cy.get(':nth-child(4) > .btn-unselect').contains('J').should('be.visible') ;
            cy.get(':nth-child(5) > .btn-unselect').contains('7J').should('be.visible') ;
            cy.get(':nth-child(6) > .btn-unselect').contains('S').should('be.visible') ;
            cy.get(':nth-child(7) > .btn-unselect').contains('M').should('be.visible') ;
            cy.get(':nth-child(8) > .btn-unselect').contains('A').should('be.visible') ;  
            cy.log("Timeline's buttons labels checked for the current language: "+ lang)  
        }
            else {
                //if the current language is english
                cy.log(lang)
            cy.get(':nth-child(3) > .btn-selected').contains('RT').should('be.visible') ;
            cy.get(':nth-child(4) > .btn-unselect').contains('D').should('be.visible') ;
            cy.get(':nth-child(5) > .btn-unselect').contains('7D').should('be.visible') ;
            cy.get(':nth-child(6) > .btn-unselect').contains('W').should('be.visible') ;
            cy.get(':nth-child(7) > .btn-unselect').contains('M').should('be.visible') ;
            cy.get(':nth-child(8) > .btn-unselect').contains('Y').should('be.visible') ;
            cy.log("Timeline's buttons labels checked for the current language: "+ lang)
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
            cy.get('.form-group').eq(1).click();
            cy.get('select').eq(0).select('en')
            lang='en'
         } else {
            cy.get('.form-group').eq(1).click();
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
 
        Cypress.Commands.add('Push', (processName, publisherV, publisherName, processId, message, type,identity,severity, startDate, endDate,summary,title)=>
{
    cy.request({
        method : 'POST',
         url : OpFabUrlCards,
        body: {
                "publisher" : publisherName,
                "processVersion" : "1",
                "process"  : processName,
                "processId" : processId,
                "state": message,
                "recipient" : {
                                        "type" : type,
                                        "identity" : identity
                                },
                "severity" : severity ,
                "tags": [
                    "MyAwesomeTag",
                    "MyTag",
                    "Emergency"
                  ],
                "startDate" : startDate,
                "endDate" : endDate,
                "summary" : {
                                 "key" : summary
                                },
                "title" : {
                                  "key" : title},
            }
            }).then(response =>{
                cy.expect(response.status).to.eq(201);
                cy.expect(response.body).to.have.property('count', 1);
                cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
                })
        })       
 
        Cypress.Commands.add('PushUnion', (publisherName,publisherV,processName,processId,message,type,severity,startDate,endDate,summary,title)=>
        {
            cy.request({
                method : 'POST',
                 url : OpFabUrlCards,
                body: {
                   "publisher" : publisherName,
                   "publisherVersion" : publisherV,
                   "process"  :processName,
                   "processId" : processId,
                   "state": message,
                   "recipient" : {
                            "type" : type,
                            "recipients" : [
                        {
                          "type": "GROUP",
                          "identity": "TSO1"
                        },
                        {
                          "type": "USER",
                          "identity": "admin"
                        }
                      ]
                         },
                   "severity" : severity,
                   "startDate" : startDate,
                   "endDate" : endDate,
                   "summary" : {"key" : summary},
                   "title" : {"key" : title},
                    }
                    }).then(response =>{
                        cy.expect(response.status).to.eq(201);
                        cy.expect(response.body).to.have.property('count', 1);
                        cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
                        })      
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
 
Cypress.Commands.add('pushEntity', (publisherName,publisherV,processName,processId, message, type, entity, severity, startDate, endDate, summary,title)=>
{
    cy.request({
        method : 'POST',
         url : OpFabUrlCards,
        body: {
           "publisher" : publisherName,
           "publisherVersion" : publisherV,
           "process"  :processName,
           "processId" : processId,
           "state": message,
           "recipient" : {
                    "type" : type,
                 },
          "entityRecipients" : [entity],    
           "severity" : severity,
           "startDate" : startDate,
           "endDate" : endDate,
           "summary" : {"key" : summary},
           "title" : {"key" : title},
           }
            }).then(response =>{
                cy.expect(response.status).to.eq(201);
                cy.expect(response.body).to.have.property('count', 1);
                cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
            })
})
Cypress.Commands.add('PushCardChart', (processName, publisherV, publisherName, processId, message, severity, startDate, endDate)=>
{
    cy.request({
        method : 'POST',
         url : OpFabUrlCards,
        body: {
                "publisher" : publisherName,
                "publisherVersion" : publisherV,
                "process"  : processName,
                "processId" : processId,
                "state": message,
                "recipient" : {
                                        "type" : "GROUP",
                                        "identity" : "TSO1"
                                },
                "severity" : severity ,
                "tags": [
                    "MyAwesomeTag",
                    "MyTag",
                    "charts"
                  ],
                "startDate" : startDate,
                "endDate" : endDate,
                "summary" : {"key" : "defaultProcess.summary"},
                "title" : {"key" : "defaultProcess.title"},
                "data" : {"values":[10,20,15,35,10,15,0]}
            }
            }).then(response =>{
                cy.expect(response.status).to.eq(201);
                cy.expect(response.body).to.have.property('count', 1);
                cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
 
                })
        })
 
        Cypress.Commands.add('PushCardNew', (processName, publisherV, publisherName, processId, message, severity, startDate, endDate)=>
        {
            cy.request({
                method : 'POST',
                url : OpFabUrlCards,
                body: {
                        "publisher" : publisherName,
                        "publisherVersion" : publisherV,
                        "process"  : processName,
                        "processId" : processId,
                        "state": message,
                        "recipient" : {
                                                "type" : "GROUP",
                                                "identity" : "TSO1"
                                        },
                        "severity" : severity ,
                        "tags": [
                            "MyAwesomeTag",
                            "MyTag",
                            "Emergency"
                          ],
                        "startDate" : startDate,
                        "endDate" : endDate,
                        "summary" : {"key" : "defaultProcess.summary"},
                        "title" : {"key" : "defaultProcess.title"},
                        "data" : {"message":"a message"}
                    }
                   }).then(response =>{
                        cy.expect(response.status).to.eq(201);
                        cy.expect(response.body).to.have.property('count', 1);
                        cy.expect(response.body).to.have.property('message', 'All pushedCards were successfully handled')
       
                        })
                })   

        Cypress.Commands.add('goToAdmin', ()=>
{
    cy.get('#drop_user_menu').click()
    cy.get('.dropdown-menu > .ng-star-inserted > .nav-link').click()
})