
describe ('Monitoring screen tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    it('Check composition of multi-filters for process groups/processes/type of state for operator1', function () {
        cy.loginOpFab('operator1', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for operator4', function () {
        cy.loginOpFab('operator4', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('li').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').contains('Select All').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for admin', function () {
        cy.loginOpFab('admin', 'test');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check the 3 multi-filters for service/process/type of state do not exist
        cy.get('#opfab-processGroup').should('not.exist');
        cy.get('#opfab-process').should('not.exist');
        cy.get('#opfab-typeOfState').should('not.exist');

        cy.get('#opfab-monitoring-no-process-state-available').should('exist');
        cy.get('#opfab-monitoring-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check composition of multi-filters for processes/states/typeOfState for operator1, with a config without process group', function () {
        cy.loginOpFab('operator1', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').should('not.exist');

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('li').should('have.length', 4);
        cy.get('#opfab-process').contains('Examples for new cards').should('exist');
        cy.get('#opfab-process').contains('Examples for new cards 2').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('li').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');

        cy.loadTestConf();
        cy.reload();
    })
})
