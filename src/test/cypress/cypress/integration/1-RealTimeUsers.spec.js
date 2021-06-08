/** Test for the OpFab real time users page */

describe ('RealTimeUsersPage',()=>{

    it('Connection of admin and check of Real time users screen : no one should be connected', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        //we should have 3 disconnected users and 1 connected user (operator1)
        //cy.get('#opfab-realtimeusers-disconnected').children().should('have.length',3);
        cy.get('#opfab-realtimeusers-connected').should('not.exist');

    })

    it('Connection of operator1', ()=>{
        cy.loginOpFab('operator1','test');
    })

    it('Connection of admin and check of Real time users screen', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        //we should have 3 disconnected users and 1 connected user (operator1)
        cy.get('#opfab-realtimeusers-disconnected').children().should('have.length',3);
        cy.get('#opfab-realtimeusers-connected').children().should('have.length',1);

    })
})