

Cypress.Commands.add('PushCard', (processName, publisherV, publisherName, processId, message, severity, startDate, endDate)=>
{
    cy.request({
        method : 'POST',
         url : 'http://10.132.146.27:2102/cards',
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
        Cypress.Commands.add('LogOpFab',(username, password)=>
        {
            cy.visit('http://10.132.146.27:89/auth/realms/dev/protocol/openid-connect/auth?response_type=code&client_id=opfab-client&redirect_uri=http://10.132.146.27:2002/ui/');
            cy.get('#username').type(username);
            cy.get('#password').type(password);
            cy.get('#kc-login').click();
        })
 
                Cypress.Commands.add('goToTimelineRT', ()=>
                {//timeline RT view
                    cy.get(':nth-child(2) > .btn-unselect').click();
                                })
                Cypress.Commands.add('goToTimelineD', ()=>
             {//timeline D view
                cy.get(':nth-child(3) > .btn-unselect').click()
                      })

             Cypress.Commands.add('goToTimelineSD', ()=>
             {//timeline 7D view
                cy.get(':nth-child(4) > .btn-unselect').click();
                                                })
             Cypress.Commands.add('goToTimelineW', ()=>
             {
                 //timeline W view
                 cy.get(':nth-child(5) > .btn-unselect').click();
             })

            Cypress.Commands.add('goToTimelineM', ()=>
             {
                 //timeline M view
            cy.get(':nth-child(6) > .btn-unselect').click();
        })
            Cypress.Commands.add('goToTimelineY', ()=>
            {
                //timeline Y view
           cy.get(':nth-child(7) > .btn-unselect').click();
        })                           

        Cypress.Commands.add('nextButton', ()=>
            {
                //click on>> button
                cy.get('[style="margin-left: 1rem"] > .circle-btn > .fas').click();
        })                           
        Cypress.Commands.add('previousButton', ()=>
            {
                //click on << button
                cy.get('[style="margin-right: 1rem;"] > .circle-btn').click();
        })                           

        Cypress.Commands.add('homeButton', ()=>
            {
                //click on home button
                cy.get('[style="margin-right: 1rem;"] > .circle-btn').click();
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
            cy.contains('Archives').click();
        })

        Cypress.Commands.add('goToFeed', ()=>
        {
            cy.get('.mr-auto > :nth-child(1) > .nav-link').click();
        })

        Cypress.Commands.add('goToSettings', ()=>
        {
            cy.get('a[id="drop_user_menu"]').click()
            cy.get('a[routerlink="/settings"]').click();

        })
        Cypress.Commands.add('goToAbout', ()=>
        {
            cy.get('a[id="drop_user_menu"]').click()
            cy.get('a[routerlink="/about"]').click();
        })

        Cypress.Commands.add('getToken', ()=>
        {
            let token;
            cy.request({
                method : 'POST',
                 url : 'http://10.132.146.27:2002/auth/token',
                form : true,
                body: {
                        'username' : 'tso1-operator',
                        'password' : 'test',
                        'grant_type' : 'password',
                        'client_id' : 'opfab-client',
                        'secret' : 'opfab-keycloack-secret'
                    }
                    }).then(response =>{
                    token = response.body.access_token; 
                return token
                }); 
            })
 
            Cypress.Commands.add('getLang', ()=>
            {
                let token;
                let lang;
                cy.request({
                    method : 'POST',
                     url : 'http://10.132.146.27:2002/auth/token',
                    form : true,
                    body: {
                            'username' : 'tso1-operator',
                            'password' : 'test',
                            'grant_type' : 'password',
                            'client_id' : 'opfab-client',
                            'secret' : 'opfab-keycloack-secret'
                        }
                        }).then(response =>{
                        token = response.body.access_token;
                        cy.log(token)
                        cy.request({
                                method : 'GET',
                                url : 'http://10.132.146.27:2002/users/users/tso1-operator/settings',
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
            cy.get(':nth-child(5) > of-text-setting > form.ng-untouched > .form-group > label').contains('Format de date').should('be.visible') ;
            cy.get(':nth-child(6) > of-text-setting > form.ng-untouched > .form-group > label').should('be.visible');
            cy.get(':nth-child(6) > of-text-setting > form.ng-untouched > .form-group > label').contains('Format date et heure/minute');
            cy.get('#time-filter-form > .form-group > label').contains('Tags par défaut').should('be.visible') ;
            cy.get('of-email-setting > form.ng-untouched > .form-group > label').contains('Adresse email').should('be.visible') ;
            cy.get(':nth-child(2) > of-list-setting > form.ng-untouched > .form-group > label').contains('Langue').should('be.visible') ;
            cy.get(':nth-child(3) > of-list-setting > form.ng-untouched > .form-group > label').contains('Zone horaire').should('be.visible') ;
            cy.get(':nth-child(4) > of-text-setting > form.ng-untouched > .form-group > label').contains('Format heure/minute').should('be.visible') ;
            cy.get(':nth-child(8) > :nth-child(1) > label').contains('Jouer des sons pour les cartes de type').should('be.visible');
            cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Alarme')
            cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Action')
            cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Conforme')
            cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Information')
            cy.log("Tout les champs ont été vérifiés//All fields have been verified")
                }          
                else { //english
                    cy.get('of-email-setting > form.ng-untouched > .form-group > label').contains('Email address').should('be.visible') ;
                    cy.get(':nth-child(2) > of-list-setting > form.ng-untouched > .form-group > label').contains('Language').should('be.visible') ;
                    cy.get(':nth-child(3) > of-list-setting > form.ng-untouched > .form-group > label').contains('Time zone').should('be.visible') ;
                    cy.get(':nth-child(4) > of-text-setting > form.ng-untouched > .form-group > label').contains('Time format').should('be.visible') ;
                    cy.get(':nth-child(5) > of-text-setting > form.ng-untouched > .form-group > label').contains('Date format').should('be.visible') ;
                    cy.get(':nth-child(6) > of-text-setting > form.ng-untouched > .form-group > label').should('be.visible');
                    cy.get(':nth-child(6) > of-text-setting > form.ng-untouched > .form-group > label').contains('Date Time format');
                    cy.get('#time-filter-form > .form-group > label').contains('Default tags').should('be.visible') ;
                    cy.get('[settingpath="playSoundForAlarm"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Alarm')
                    cy.get('[settingpath="playSoundForAction"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Action')
                    cy.get('[settingpath="playSoundForCompliant"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Compliant')
                    cy.get('[settingpath="playSoundForInformation"] > #checkbox-setting-form > .form-group > .form-check-label').contains('Information')
                    cy.log("Tout les champs ont été vérifiés//All fields have been verified")
                }
            })

    Cypress.Commands.add('ChangeLang', (currentLanguage)=>
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
             url : 'http://10.132.146.27:2002/auth/token',
            //failOnStatusCode: false,
            form : true,
            body: {
                    'username' : 'tso1-operator',
                    'password' : 'test',
                    'grant_type' : 'password',
                    'client_id' : 'opfab-client',
                    'secret' : 'opfab-keycloack-secret'
                }
                }).then(response =>{
                token = response.body.access_token;
                cy.request({
                        method : 'PUT',
                        url : 'http://10.132.146.27:2002/users/users/tso1-operator/settings',
                     failOnStatusCode: false,
                        auth: {
                            'bearer': token
                        },
                        body: {
                          'login' : 'tso1-operator',
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
        if( lang === 'en' )
        {          
         cy.get(':nth-child(1) > of-multi-filter > .form-group > label').contains('Tags').should('be.visible'); 
         cy.get(':nth-child(2) > of-multi-filter > .form-group > label').contains('Process').should('be.visible');
         cy.get(':nth-child(2) > .ng-dirty > .form-row > .form-group > label').contains('Publish Date From').should('be.visible');
         cy.get(':nth-child(3) > .ng-dirty > .form-row > .form-group > label').contains('Publish Date To').should('be.visible');
         cy.get(':nth-child(4) > .ng-dirty > .form-row > .form-group > label').contains('Active From').should('be.visible');
         cy.get(':nth-child(5) > .ng-dirty > .form-row > .form-group > label').contains('Active To').should('be.visible');
         cy.get('button[class="btn btn-primary w-100 archive-radius"]').contains('Search').should('be.visible');
        }   
        else
        {
          cy.get(':nth-child(1) > of-multi-filter > .form-group > label').contains('Etiquettes').should('be.visible')
          cy.get(':nth-child(2) > of-multi-filter > .form-group > label').contains('Processus').should('be.visible');
          cy.get(':nth-child(2) > .ng-dirty > .form-row > .form-group > label').contains('Publication à partir de').should('be.visible');
          cy.get(':nth-child(3) > .ng-dirty > .form-row > .form-group > label').contains('Publication jusqu\'à').should('be.visible');
          cy.get(':nth-child(4) > .ng-dirty > .form-row > .form-group > label').contains('Active à partir de').should('be.visible');
          cy.get(':nth-child(5) > .ng-dirty > .form-row > .form-group > label').contains('Active jusqu\'à').should('be.visible');
          cy.get('button[class="btn btn-primary w-100 archive-radius"]').contains('Rechercher').should('be.visible');
        }
    })

    Cypress.Commands.add('checkArchivedCard', (lang,color,dateDisplayed,dateDisplayedFr)=>
    {
    if (lang ==='en') { 
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
        cy.get('h2').contains('You received the following message ');
        cy.get('span[class="nav-link"]').eq(0).contains('Message');//cy.get('.nav > .nav-item > .nav-link')
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
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayedFr).click({ force: true })
        cy.get('h2').contains('Vous avez reçu le message suivant ');
        cy.get('span[class="nav-link"]').eq(0).contains('Message');//cy.get('.nav > .nav-item > .nav-link')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message reçu')
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border'); 
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border'); 
        cy.should('be.visible');
        cy.should('have.css', 'background-color',color);
        }
    })

    Cypress.Commands.add('checkTimelineButtons',(lang)=>
    {
        if (lang === 'fr'){
            cy.log(lang)
            cy.get(':nth-child(2) > .btn-selected').contains('TR').should('be.visible') ;
            cy.get(':nth-child(3) > .btn-unselect').contains('J').should('be.visible') ;
            cy.get(':nth-child(4) > .btn-unselect').contains('7J').should('be.visible') ;
            // A corriger
            cy.get(':nth-child(5) > .btn-unselect').contains('W').should('be.visible') ;
            cy.get(':nth-child(6) > .btn-unselect').contains('M').should('be.visible') ;
            cy.get(':nth-child(7) > .btn-unselect').contains('A').should('be.visible') ;   
        }
            else {
                cy.log(lang)
            cy.get(':nth-child(2) > .btn-selected').contains('RT').should('be.visible') ;
            cy.get(':nth-child(3) > .btn-unselect').contains('D').should('be.visible') ;
            cy.get(':nth-child(4) > .btn-unselect').contains('7D').should('be.visible') ;
            cy.get(':nth-child(5) > .btn-unselect').contains('W').should('be.visible') ;
            cy.get(':nth-child(6) > .btn-unselect').contains('M').should('be.visible') ;
            cy.get(':nth-child(7) > .btn-unselect').contains('Y').should('be.visible') ;
            }
    })

    Cypress.Commands.add('checkMenus',(lang)=>
    {
        if(lang === 'fr')
        {            
            cy.goToFeed();
            cy.get('a[href="#/feed"]').contains('Flux de cartes').should('be.visible')
            cy.log("Feed menu checked")
            cy.goToArchives()
            cy.get('a[href="#/archives"]').contains('Archives').should('be.visible') ;
            cy.log("Archives checked")
        }else{
            cy.goToFeed();
            cy.get('a[href="#/feed"]').contains('Card Feed').should('be.visible') ;
            cy.log("Feed menu checked")
            cy.goToArchives()
            cy.get('a[href="#/archives"]').contains('Archives').should('be.visible')
             cy.log("Archives checked")  
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

Cypress.Commands.add('checkFeed', (lang,color,dateDisplayed,dateDisplayedFr)=>
    {
        if (lang ==='en') { 
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayed).click({ force: true })
            cy.get('h2').contains('You received the following message ');
            cy.get('span[class="nav-link"]').eq(0).contains('Message');//cy.get('.nav > .nav-item > .nav-link')
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .card-text').contains('Message received')
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .badge-border'); 
            cy.should('be.visible');
            cy.should('have.css', 'background-color',color);
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-body > .badge-border'); 
            cy.should('be.visible');
            cy.should('have.css', 'background-color',color);    
        }else{
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-title').contains('Message')
            cy.get(':nth-child(1) > .col-12 > of-card > .card > .card-header > .p-1 > .card-subtitle').contains(dateDisplayedFr).click({ force: true })
            cy.get('h2').contains('Vous avez reçu le message suivant');
            cy.get('span[class="nav-link"]').eq(0).contains('Message');//cy.get('.nav > .nav-item > .nav-link')
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
        cy.get('.popover-header > span').contains('Temps').should('be.visible')
        cy.get('#start > label').contains('Début').should('be.visible')
        cy.get('#end > label').contains('Fin').should('be.visible')
        cy.get('[style="text-align:center"] > :nth-child(1)').contains('Annuler').should('be.visible')
        cy.get('#confirm_button').contains('OK').should('be.visible')
         }else{
        cy.get('.popover-header > span').contains('Time').should('be.visible')
        cy.get('#start > label').contains('Start').should('be.visible')
        cy.get('#end > label').contains('End').should('be.visible')
        cy.get('[style="text-align:center"] > :nth-child(1)').contains('Cancel').should('be.visible')
        cy.get('#confirm_button').contains('OK').should('be.visible')
    }
     })