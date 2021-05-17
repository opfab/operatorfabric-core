/** Test for the OpFab login page (used with password mode) */

describe ('LoginPage',()=>{

    let username = 'admin';
    let password = 'test';

    it('login', ()=>{

        //go to login page
        cy.visit("/")

        //type login
        cy.get('#opfab-login').should('be.visible')
        cy.get('#opfab-login').type(username)

        //type password
        cy.get('#opfab-password').should('be.visible')
        cy.get('#opfab-password').type(password)

        //press login button
        cy.get('#opfab-login-btn-submit').click()
        cy.get('#opfab-login-btn-submit').should('be.visible')

        //Check that the browser has been redirected to the feed page
        cy.hash().should('eq', '#/feed')

        //Basic check that we got past the login page
        cy.get('of-navbar').should('exist');
        // TODO Check other things of the general feed layout: navbar should have at least one item, etc.

    })
})