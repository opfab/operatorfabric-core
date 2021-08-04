
describe ('Archives screen tests',function () {

    before('Set up configuration and clean archived cards', function () {
        cy.loadTestConf();
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
    });


    it('Check archived cards reception', function () {
        cy.loginOpFab('operator1','test');

        // We move to archives screen
        cy.get('#opfab-navbar-menu-archives').click();

        // We click the search button
        cy.get('#opfab-archives-btn-search').click();

        // operator1 should see 6 archived cards
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);

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

        // We send again the test cards and we check that the we have 6 lines of archived cards (6 * 2 instances per card)
        // and we check we have plus icon for each line
        cy.send6TestCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We select all process groups
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We choose the process 'Process example'
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();

        // We check every state is present except 'Planned outage date response' because 'isOnlyAChildState' attribute is set to true for this state
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').contains('Message').should('exist');
        cy.get('#opfab-state').contains('A Chart').should('exist');
        cy.get('#opfab-state').contains('Process example').should('exist');
        cy.get('#opfab-state').contains('Electricity consumption forecast').should('exist');
        cy.get('#opfab-state').contains('Action required').should('exist');
        cy.get('#opfab-state').contains('Additional information required').should('exist');
        cy.get('#opfab-state').contains('Network Contingencies').should('exist');
        cy.get('#opfab-state').contains('Planned outage date response').should('not.exist');

    })
})
