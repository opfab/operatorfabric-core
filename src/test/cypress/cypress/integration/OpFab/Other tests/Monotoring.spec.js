// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('logginf',()=>{
  it('login and send a card', ()=>{
    
   cy.LogOpFab('tso1-operator', 'test')
   cy.wait(500)
   
   cy.get(':nth-child(3) > .nav-link').click()
   cy.get('.col-md-12 > [translate=""]').contains('Process')
   cy.get('thead > tr > :nth-child(1)').contains('Time')
   cy.get('[colspan="2"]').contains('Business Period')
   cy.get('thead > tr > :nth-child(3)').contains('Process')
   cy.get('thead > tr > :nth-child(4)').contains('Title')
   cy.get('thead > tr > :nth-child(5)').contains('Summary')
   cy.get('thead > tr > :nth-child(6)').contains('Status')


   cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .form-group > #date')
   cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .ngb-tp-input')
   cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .ngb-tp-input')

   cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .form-group > #date')
   cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .ngb-tp-input')
   cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .ngb-tp-input')

   cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .form-group > #date')
   cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .ngb-tp-input')
   cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .ngb-tp-input')

   cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .form-group > #date')
   cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-hour > .ngb-tp-input')
   cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .col-4 > .ng-untouched > fieldset > .ngb-tp > .ngb-tp-minute > .ngb-tp-input')
   
   
   cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish From')
   cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish To')
   cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active From')
   cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active To')


   })
})