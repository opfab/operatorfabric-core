
describe ('FeedScreen tests',function () {

    before('Set up configuration', function () {

        // This clears existing processGroups, bundles and perimeters and load the test configuration
        cy.exec('cd .. && ./resources/loadTestConf.sh '+Cypress.env('host'));

        let cards = [
            {

            }
        ]


    });

    beforeEach('Send test cards', function () {

        cy.exec('cd .. && ./resources/delete6TestCards.sh '+Cypress.env('host'));
        cy.exec('cd .. && ./resources/send6TestCards.sh '+Cypress.env('host'));

    });

    it('Check card reception and read behaviour', function () {

        cy.LogOpFab('operator1','test');

        // operator1 should see 6 cards in their feed
        cy.get('of-light-card').should('have.length',6);

        // No card detail is displayed
        cy.get('of-card-details').should('not.exist');

        // Title and subtitle should be unread (bold) for all 6 cards
        cy.get('of-light-card').find('.card-title, .card-title')
            .each((item, index) => {
                cy.wrap(item)
                    .should('have.css', 'font-weight')
                    .and('match', /700|bold/); // Some browsers (Chrome for example) render "bold" as "700"
            })

        // No summary should be displayed
        cy.get('[id^=opfab-feed-light-card]')
            .each((item, index) => {
                cy.wrap(item).find('#opfab-selected-card-summary').should('not.exist');
            })

        // Click on the first card:
        // - it should move to the side
        // - its summary should be displayed
        // - browser should navigate to url of corresponding card
        // - a card detail should be displayed
        cy.get('of-light-card').eq(0).click()
            .find('[id^=opfab-feed-light-card]')
            .should('have.class', 'light-card-detail-selected')
            .should('have.css', 'margin-left','20px')
            .invoke('attr', 'data-urlId')
            .as('firstCardUrlId')
            .then((urlId) => {
                cy.hash().should('eq', '#/feed/cards/'+urlId);
                cy.get('of-card-details').find('of-detail');
            });

        // Click on the second card:
        // - it should move to the side
        // - browser should navigate to url of corresponding card
        // - a card detail should be displayed
        cy.get('of-light-card').eq(1).click()
            .find('[id^=opfab-feed-light-card]')
            .should('have.class', 'light-card-detail-selected')
            .should('have.css', 'margin-left','20px')
            .invoke('attr', 'data-urlId')
            .then((urlId) => {
                cy.hash().should('eq', '#/feed/cards/'+urlId);
                cy.get('of-card-details').find('of-detail');
            });

        // First card should no longer be bold and to the side
        cy.get('@firstCardUrlId').then((firstCardUrlId) => {
            cy.get(`[data-urlId="${firstCardUrlId}"]`)
                .should('not.have.class', 'light-card-detail-selected')
                .should('not.have.css', 'margin-left','20px')
                .find('.card-title, .card-title')
                .should('have.css', 'font-weight')
                .and('match', /400|normal/);
        });




    })
})
