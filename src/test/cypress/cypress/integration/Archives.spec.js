
describe ('Archives screen tests',function () {

    before('Set up configuration and clean archived cards', function () {
        cy.loadTestConf();
    });


    it('Check archived cards reception', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1','test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We click the search button
        cy.get('#opfab-archives-btn-search').click();

        // operator1 should see 6 archived cards
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        // No plus icon is displayed
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('not.exist');
        // No minus icon is displayed
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').should('not.exist');

        // No card detail is displayed
        cy.get('of-card-detail').should('not.exist');

        // Pagination should display ' Results number  : 6 '
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We delete the test cards and we check that we still have the corresponding archived cards
        cy.deleteAllCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We send again the test cards and we check that the we have 10 lines of archived cards
        // and we check there is no plus or minus icon (because 'collapsible updates' mode is not activated)
        cy.send6TestCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',10);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').should('not.exist');
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 12 ');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});

        // We check that the we have 6 lines of archived cards (6 * 2 instances per card)
        // and we check we have plus icon for each line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});
    })

    it('Check behaviour of "isOnlyAChildState" attribute (in file config.json of bundles)', function () {
        cy.loginOpFab('operator1', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We select all process groups
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We choose the process 'Process example'
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();

        // We check every state is present except 'Planned outage date response' because 'isOnlyAChildState' attribute is set to true for this state
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('li').should('have.length', 8);
        // One list item is for the process 
        cy.get('#opfab-state').contains('Process example').should('exist');
        cy.get('#opfab-state').contains('Message').should('exist');
        cy.get('#opfab-state').contains('A Chart').should('exist');
        cy.get('#opfab-state').contains('Process example').should('exist');
        cy.get('#opfab-state').contains('Electricity consumption forecast').should('exist');
        cy.get('#opfab-state').contains('Action required').should('exist');
        cy.get('#opfab-state').contains('Additional information required').should('exist');
        cy.get('#opfab-state').contains('Network Contingencies').should('exist');
        cy.get('#opfab-state').contains('Planned outage date response').should('not.exist');
    })

    it('Check behaviour of plus/minus icons', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1', 'test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We send again the test cards, we activate the 'collapsible updates' mode and we check that the we have 6 lines of
        // archived cards (6 * 2 instances per card) and we check we have plus icon for each line
        cy.send6TestCards();
        cy.get('#opfab-archives-btn-search').click();

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});

        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ');

        // We click plus icon and we check we see one more archived card for the corresponding line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').first().click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',7);

        // We check there is a minus icon in place of the plus icon
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-minus').should('have.length', 1);

        // We check there is neither plus icon nor minus icon on the additional line
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(1).find('.opfab-archives-icon-plus').should('not.exist');
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').eq(1).find('.opfab-archives-icon-minus').should('not.exist');

        // We click minus icon and we check the additional line disappear
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').first().click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);

        // We check there is a plus icon in place of the minus icon
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-plus').should('have.length', 1);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').first().find('.opfab-archives-icon-minus').should('not.exist');

        // We click collapsible updates
        cy.get('#opfab-archives-collapsible-updates').click({force: true});
    })
})
