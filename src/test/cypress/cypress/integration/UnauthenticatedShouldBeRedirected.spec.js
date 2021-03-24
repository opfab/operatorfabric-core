
const featureUrls = [
    '#/feed/cards',
    '#/archives',
    '#/monitoring',
    '#/logging',
    '#/businessconfigparty/menu1/uid_test_0',
    '#/feed/cards',
    '#/calendar',
    '#/admin',
    '#/settings',
    '#/feedconfiguration',
    '#/someotherpathsthatdoestexist'
]

describe ('Unauthenticated user should be redirected',()=>{

    //If attempting to access app pages, an unauthenticated user should be redirected to the feed page and it should
    //display the login component

    featureUrls.forEach((url) => {
        it('Unauthenticated attempt to access url ' + url, ()=>{

            cy.visit(url)

            //Check that the browser has been redirected to the feed page
            cy.hash().should('eq', '#/feed')

            //Check that it is showing the login component
            cy.get('#opfab-login').should('be.visible')

        })
    })

})