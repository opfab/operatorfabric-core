
describe ('Archives screen tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteAllArchivedCards();
        cy.sendTestCards();
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
        cy.deleteTestCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',6);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 6 ')

        // We send again the test cards and we check that the we have 12 archived cards (10 archived cards displayed for first page)
        cy.sendTestCards();
        cy.get('#opfab-archives-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length',10);
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : 12 ')
    })
})
