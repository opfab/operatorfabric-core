// This test sends a card with a random severtiy and check after it content 
//This test won't work if cards are displayed according to their severity. It works only the default display mode


describe ('basicCheck',()=>{
        it('login and send a card', ()=>
        {
            //send a card that has
            cy.LogOpFab('tso1-operator', 'test');
            let possibleSeverities= ['ALARM', 'ACTION', 'INFORMATION', 'COMPLIANT'];

            let severity = possibleSeverities[Math.floor(Math.random() * possibleSeverities.length)];
            cy.log(severity)
            let message = "messageState"
            let publisherV = "1"
            let publisherName = "api_test"
            let processName = "defaultProcess"
            let startDate = Cypress.moment().format('x')
            let startdatedisplayed = Cypress.moment().format('L LT')
                       //Verify that it is a number otherwise cy.log(typeof startDate)
            let startDateint = parseInt(startDate) 
            let endDatedisplayed = (Cypress.moment().add(1, 'day').format('L LT'))
            const endDate = parseInt(Cypress.moment().add(1, 'day').format('x'))
            let dateDisplayed = "("+ startdatedisplayed + " - " + endDatedisplayed + ")"
            cy.log (dateDisplayed)
            cy.log (startDate)
            cy.log (endDate)
            cy.log (startdatedisplayed)
            cy.log (endDatedisplayed)
        
            let red = 'rgb(238, 0, 0)'
            let green = 'rgb(0, 187, 0)'
            let bleue = 'rgb(16, 116, 172)'
            let yellow = 'rgb(253, 147, 18)'

            var color ='color';
            
            cy.log(severity)

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
           
           
            cy.log(color)
            let processId = "Cy-" + startDate
            cy.log(processId)

            cy.PushCard(processName, publisherV, publisherName, processId, message, severity, startDateint, endDate); 
            cy.wait(9000)

            cy.log(color)  

// Check card created

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

//check timeline

cy.goToTimelineD();
cy.wait(200)
cy.goToTimelineSD();
cy.wait(200)
cy.goToTimelineM();
cy.wait(200)
cy.goToTimelineY();
cy.wait(200)
cy.goToTimelineRT();
cy.wait(200)
cy.nextButton();
cy.wait(200)
cy.previousButton();
cy.wait(200)
cy.homeButton();
cy.wait(200)
cy.timelineRTChekMinutes();
cy.wait(200)
//check archives

cy.goToArchives();
cy.get('.archive-radius').click();


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


cy.goToSettings()
cy.wait(1200)

cy.goToFeed()
        })

    })