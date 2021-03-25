/** This is just a simple test to experiment with programmatic login and how information is shared between tests
 * before extending it to all tests.
 * */

describe('LogInProgrammatically', () => {

    before(() => {
        cy.getToken('admin','test')
    })

    describe('First set of tests', () => {

        it('Test 1', function () {
            cy.log(this.getTokenResponse)
            expect(this.getTokenResponse).to.exist   // true
            cy.visitWithToken('/')
            cy.get('#opfab-navbar-menu-feed')
        })

        it('Test 2', function () {
            expect(this.getTokenResponse).to.exist
            cy.get('#opfab-navbar-menu-archives').click()
            cy.log('End of test 2')
        })

    })

    describe('Second set of tests', () => {

        it('Test 3', function () {
            cy.log(this.getTokenResponse)
            expect(this.getTokenResponse).to.exist   // true
            cy.visitWithToken('/')
            cy.get('#opfab-navbar-menu-feed')
        })

        it('Test 4', function () {
            expect(this.getTokenResponse).to.exist
            cy.get('#opfab-navbar-menu-archives').click()
            cy.log('End of test 4')
        })

    })


})