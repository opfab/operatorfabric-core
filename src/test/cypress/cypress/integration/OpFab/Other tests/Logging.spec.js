// This test sends a card with a random severtiy and check after it content
//This test won't work if cards are displayed according to their severity. It works only the default display mode
describe ('logginf',()=>{
  it('login and send a card', ()=>{
    
   cy.LogOpFab('tso1-operator', 'test')
   cy.wait(500)
   cy.get(':nth-child(6) > .nav-link').click()
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
   
   cy.get(':nth-child(1) > .fas').click()
   cy.wait(500)
   cy.get('#reset > .fas')
   cy.get('of-multi-filter > .form-group > label').contains('Service')
   cy.get(':nth-child(2) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish From')
   cy.get(':nth-child(3) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Publish To')
   cy.get(':nth-child(4) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active From')
   cy.get(':nth-child(5) > of-datetime-filter.ng-untouched > .form-row > .form-group > label').contains('Active To')


   cy.get('thead > tr > :nth-child(1)').contains('Time of Action')
   cy.get('thead > tr > :nth-child(2)').contains('Title')
   cy.get('thead > tr > :nth-child(3)').contains('Description')
   cy.get('thead > tr > :nth-child(5)').contains('Sender')

   cy.get(':nth-child(6) > :nth-child(2)').contains('⚠️ Network Contingencies ⚠️')
   
     

   })
})