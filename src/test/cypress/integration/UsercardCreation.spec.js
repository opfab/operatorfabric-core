// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('UsercardCreation',()=>{

  let login='operator1'
  let password='test'
  let startDate = Cypress.moment().add(1,'minute').format('HH:mm DD/MM/YYYY')
it('go to card creation and create a card', ()=>{
   cy.LogOpFab(login, password)
   cy.get('#opfab-feed-filter-btn-sort').click()
   cy.get('#sort-form > :nth-child(2) > [translate=""]').click()
   //create a card
   cy.get('.opfab-menu-icon-newcard').click()
   cy.get('.col.ng-star-inserted > of-single-filter > .opfab-select > .ng-pristine').select('Service numéro 1')
   cy.get(':nth-child(2) > .opfab-select > .ng-untouched').select('Exemples de nouvelles cartes')
   cy.get(':nth-child(3) > of-single-filter > .opfab-select > .ng-untouched').select('Incident SI')
   cy.get(':nth-child(2) > .opfab-radio-button-checkmark').click()
   cy.get('#message').type('Test Manuel')
   cy.get(':nth-child(1) > .opfab-checkbox > .opfab-checkbox-checkmark').click()
   cy.get('#OTHERS').type('Manual Test')
   cy.get('.c-btn').click()
   cy.get('.lazyContainer > :nth-child(2)').click()
   cy.get('.lazyContainer > :nth-child(3)').click()
   cy.get('.lazyContainer > :nth-child(4)').click()
   cy.get('#opfab-usercard-btn-prepareCard').click()
   cy.wait(500)

   //Check the preview

   cy.get(':nth-child(1) > .opfab-section-header > span').contains('DESTINATAIRES:')
   cy.get('[style="display: inline-flex;"] > :nth-child(1) > span').contains('Control Room 1')
   cy.get('[style="display: inline-flex;"] > :nth-child(2) > span').contains('Control Room 2')
   cy.get('[style="display: inline-flex;"] > :nth-child(3) > span').contains('Control Room 3')
   cy.get(':nth-child(2) > :nth-child(2) > :nth-child(1) > span').contains('PREVISUALISATION FEED')
   //cy.get('[class="card-title text-uppercase"]').contains("INCIDENT SI")
   cy.get(':nth-child(2) > :nth-child(2) > :nth-child(3) > span').contains('PREVISUALISATION CONTENU')
   cy.get('#opfab-card-template-detail > :nth-child(1) > :nth-child(4)').contains(' Services impactés vu SI : ')
   cy.get('#impacts').contains(' Service A')
   cy.get('#opfab-usercard-btn-accept').click()
   cy.get('#div-detail-msg')
   cy.get('#div-detail-msg > #opfab-usercard-close > span').click()
   cy.contains(startDate+' - )').click()
   //cy.contains('IT Incident SI en cours')
   cy.get('strong').contains('Merci de saisir les impacts que vous identifiez de votre coté')
   cy.get('#div-card-template > :nth-child(1) > :nth-child(1)').contains('Description de l\'incident')
   cy.get('#div-card-template > :nth-child(1) > :nth-child(4)').contains('Services impactés vu SI')
})   
   })