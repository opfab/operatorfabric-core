/** Test for the OpFab real time users page */

describe ('RealTimeUsersPage',()=>{

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
        cy.get('.opfab-realtimeusers-userslist').eq(0).children().should('have.length',3);
        cy.get('.opfab-realtimeusers-userslist').eq(1).should('have.length',1);

        cy.wrap(true).should('be.false'); //To make the test fail so we have detailed output

    })
})