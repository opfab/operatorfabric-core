
describe ('FeedScreen tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteTestCards();
        cy.sendTestCards();
    });

    after('Clean', function () {
        cy.deleteTestCards();
    });


    it('Check card reception and read behaviour', function () {

        cy.loginOpFab('operator1','test');

        // Set feed sort to "Date" so the cards don't move down the feed once they're read
        cy.get('#opfab-feed-filter-btn-sort').click();
        cy.get('#sort-form').find('input[value=date]').parent().click();
        cy.get('#opfab-feed-filter-btn-sort').click();

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



        // Click on the second card (taken from first card's siblings to avoid clicking the same card twice):
        // - it should move to the side
        // - browser should navigate to url of corresponding card
        // - a card detail should be displayed
        cy.get('@firstCardUrlId').then((firstCardUrlId) => {
            cy.get(`[data-urlId="${firstCardUrlId}"]`).parent().parent().parent().siblings().eq(0).click()
                .find('[id^=opfab-feed-light-card]')
                .should('have.class', 'light-card-detail-selected')
                .should('have.css', 'margin-left','20px')
                .invoke('attr', 'data-urlId')
                .then((urlId) => {
                    cy.hash().should('eq', '#/feed/cards/'+urlId);
                    cy.get('of-card-details').find('of-detail');
                });
        });

        // Temporary fix for the `cy...failed because the element has been detached from the DOM` error (see OC-1669)
        cy.waitDefaultTime();

        // First card should no longer be bold and to the side
        cy.get('@firstCardUrlId').then((firstCardUrlId) => {
            cy.get(`[data-urlId="${firstCardUrlId}"]`)
                .should('not.have.class', 'light-card-detail-selected')
                .should('not.have.css', 'margin-left','20px')
                .find('.card-title, .card-title')
                .should('have.css', 'font-weight')
                .and('match', /400|normal/);
        });

        // TODO Test on other card that it gets read when clicking cross

        // TODO Test read if navigating to other page and back

        // TODO Test with sort set to unread first




    })
})
