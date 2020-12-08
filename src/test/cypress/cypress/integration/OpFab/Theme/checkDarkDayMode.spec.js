
// check background colors in the Dark mode than switch to day mode 
let user='operator1'
let password='test'
describe ('filter by severity',()=>{
  it('Check severity filters',()=>{
  cy.LogOpFab(user, password);           
  cy.wait(1200);
  cy.checkDarkMode()
  cy.goToArchives();
  cy.checkDarkMode()
  cy.goToSettings();
  cy.checkDarkMode()
  cy.goToFeed();
  cy.wait(600);
  cy.checkDarkMode()
  cy.get('.btn > .fas').click()//switch Day mode
  cy.wait(600)
  cy.checkDayMode()
  cy.goToArchives();
  cy.checkDayMode()
  cy.goToSettings();
  cy.checkDayMode()
  cy.goToFeed();
})
})