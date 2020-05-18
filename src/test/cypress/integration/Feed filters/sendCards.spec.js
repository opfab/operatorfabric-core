describe ('sendCards and filter by severity',()=>{
   it('Send 12 cars then apply severity filter',()=>{
    let message = "messageState"
    let publisherV = "1"
    let publisherName = "api_test"
   let processName = "defaultProcess"
   cy.LogOpFab('tso1-operator', 'test');            
   cy.wait(600)

//Alarm First card
let startDtAlFst = Cypress.moment().format('x')
let startDtDisAlFstFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAlFst = Cypress.moment().format('L LT')       
let startDtintAlFst = parseInt(startDtAlFst) 
let endDtdisplayedAlFst = (Cypress.moment().add(1, 'day').format('L LT'))
let endDtdisplayedAlFstFr = (Cypress.moment().add(1, 'day').format('DD/MM/YYYY HH:mm'))
const endDtAlFst = parseInt(Cypress.moment().add(1, 'day').format('x'))
let DateDisplayedAlFst = "("+ startDtDisAlFst + " - " + endDtdisplayedAlFst + ")"
let DateDisplayedAlFstFr = "("+ startDtDisAlFstFr + " - " + endDtdisplayedAlFstFr + ")"
let processIdAlFst = "Cy-AlFst-"+ startDtAlFst
cy.PushCard(processName, publisherV, publisherName, processIdAlFst, message, 'ALARM', startDtintAlFst, endDtAlFst); 
cy.wait(1200)
//Action First card
let startDtAcFst = Cypress.moment().format('x')
let startDtDisAcFstFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAcFst = Cypress.moment().format('L LT')       
let startDtintAcFst = parseInt(startDtAcFst) 
let endDtdisplayedAcFst = (Cypress.moment().add(1, 'month').format('L LT'))
let endDtdisplayedAcFstFr = (Cypress.moment().add(1, 'month').format('DD/MM/YYYY HH:mm'))
const endDtAcFst = parseInt(Cypress.moment().add(1, 'month').format('x'))
let DateDisplayedAcFst = "("+ startDtDisAcFst + " - " + endDtdisplayedAcFst + ")"
let DateDisplayedAcFstFr = "("+ startDtDisAcFstFr + " - " + endDtdisplayedAcFstFr + ")"
let processIdAcFst = "Cy-AcFst-"+ startDtAcFst
cy.PushCard(processName, publisherV, publisherName, processIdAcFst, message, 'ACTION', startDtintAcFst, endDtAcFst); 
cy.wait(1200) 
//Compliant First card
let startDtCpFst = Cypress.moment().format('x')
let startDtDisCpFstFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisCpFst = Cypress.moment().format('L LT')       
let startDtintCpFst = parseInt(startDtCpFst) 
let endDtdisplayedCpFst = (Cypress.moment().add(1, 'year').format('L LT'))
let endDtdisplayedCpFstFr = (Cypress.moment().add(1, 'year').format('DD/MM/YYYY HH:mm'))
const endDtCpFst = parseInt(Cypress.moment().add(1, 'year').format('x'))
let DateDisplayedCpFst = "("+ startDtDisCpFst + " - " + endDtdisplayedCpFst + ")"
let DateDisplayedCpFstFr = "("+ startDtDisCpFstFr + " - " + endDtdisplayedCpFstFr + ")"
let processIdCpFst = "Cy-CpFst-"+ startDtCpFst
cy.PushCard(processName, publisherV, publisherName, processIdCpFst, message, 'COMPLIANT', startDtintCpFst, endDtCpFst); 
cy.wait(1200) 

//Information First card
let startDtInFst = Cypress.moment().format('x')
let startDtDisInFstFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisInFst = Cypress.moment().format('L LT')       
let startDtintInFst = parseInt(startDtInFst) 
let endDtdisplayedInFst = (Cypress.moment().add(1, 'day').format('L LT'))
let endDtdisplayedInFstFr = (Cypress.moment().add(1, 'day').format('DD/MM/YYYY HH:mm'))
const endDtInFst = parseInt(Cypress.moment().add(1, 'day').format('x'))
let DateDisplayedInFst = "("+ startDtDisInFst + " - " + endDtdisplayedInFst + ")"
let DateDisplayedInFstFr = "("+ startDtDisInFstFr + " - " + endDtdisplayedInFstFr + ")"
let processIdInFst = "Cy-InFst-"+ startDtInFst
cy.PushCard(processName, publisherV, publisherName, processIdInFst, message, 'INFORMATION', startDtintInFst, endDtInFst); 
cy.wait(1200) 

// Alarm Second card 
let startDtAlSnd = Cypress.moment().format('x')
let startDtDisAlSndtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAlSnd = Cypress.moment().format('L LT')       
let startDtintAlSnd = parseInt(startDtAlSnd) 
let endDtdisplayedAlSnd = (Cypress.moment().add(1, 'hour').format('L LT'))
let endDtdisplayedAlSndFr = (Cypress.moment().add(1, 'hour').format('DD/MM/YYYY HH:mm'))
const endDtAlSnd = parseInt(Cypress.moment().add(1, 'hour').format('x'))
let DateDisplayedAlSnd = "("+ startDtDisAlSnd + " - " + endDtdisplayedAlSnd + ")"
let DateDisplayedAlSndFr = "("+ startDtDisAlSndtFr + " - " + endDtdisplayedAlSndFr + ")"
let processIdAlSnd = "Cy-AlSnd-"+ startDtAlSnd
cy.PushCard(processName, publisherV, publisherName, processIdAlSnd, message, 'ALARM', startDtintAlSnd, endDtAlSnd);
cy.wait(1200) 

// Action Second card 
let startDtAcSnd = Cypress.moment().format('x')
let startDtDisAcSndtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAcSnd = Cypress.moment().format('L LT')       
let startDtintAcSnd = parseInt(startDtAcSnd) 
let endDtdisplayedAcSnd = (Cypress.moment().add(1, 'hour').format('L LT'))
let endDtdisplayedAcSndFr = (Cypress.moment().add(1, 'hour').format('DD/MM/YYYY HH:mm'))
const endDtAcSnd = parseInt(Cypress.moment().add(1, 'hour').format('x'))
let DateDisplayedAcSnd = "("+ startDtDisAcSnd + " - " + endDtdisplayedAcSnd + ")"
let DateDisplayedAcSndFr = "("+ startDtDisAcSndtFr + " - " + endDtdisplayedAcSndFr + ")"
let processIdAcSnd = "Cy-AcSnd-"+ startDtAcSnd
cy.PushCard(processName, publisherV, publisherName, processIdAcSnd, message, 'ACTION', startDtintAcSnd, endDtAcSnd);
cy.wait(1200) 

// Compliant Second card 
let startDtCpSnd = Cypress.moment().format('x')
let startDtDisCpSndtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisCpSnd = Cypress.moment().format('L LT')       
let startDtintCpSnd = parseInt(startDtCpSnd) 
let endDtdisplayedCpSnd = (Cypress.moment().add(1, 'hour').format('L LT'))
let endDtdisplayedCpSndFr = (Cypress.moment().add(1, 'hour').format('DD/MM/YYYY HH:mm'))
const endDtCpSnd = parseInt(Cypress.moment().add(1, 'hour').format('x'))
let DateDisplayedCpSnd = "("+ startDtDisCpSnd + " - " + endDtdisplayedCpSnd + ")"
let DateDisplayedCpSndFr = "("+ startDtDisCpSndtFr + " - " + endDtdisplayedCpSndFr + ")"
let processIdCpSnd = "Cy-CpSnd-"+ startDtCpSnd
cy.PushCard(processName, publisherV, publisherName, processIdCpSnd, message, 'COMPLIANT', startDtintCpSnd, endDtCpSnd);
cy.wait(1200) 

// Second card Information
let startDtInSnd = Cypress.moment().format('x')
let startDtDisInSndtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisInSnd = Cypress.moment().format('L LT')       
let startDtintInSnd = parseInt(startDtInSnd) 
let endDtdisplayedInSnd = (Cypress.moment().add(1, 'hour').format('L LT'))
let endDtdisplayedInSndFr = (Cypress.moment().add(1, 'hour').format('DD/MM/YYYY HH:mm'))
const endDtInSnd = parseInt(Cypress.moment().add(1, 'hour').format('x'))
let DateDisplayedInSnd = "("+ startDtDisInSnd + " - " + endDtdisplayedInSnd + ")"
let DateDisplayedInSndFr = "("+ startDtDisInSndtFr + " - " + endDtdisplayedInSndFr + ")"
let processIdInSnd = "Cy-InSnd-"+ startDtInSnd
cy.PushCard(processName, publisherV, publisherName, processIdInSnd, message, 'INFORMATION', startDtintInSnd, endDtInSnd);
cy.wait(1200) 

//Alarm Third Card
let startDtAlTrd = Cypress.moment().format('x')
let startDtDisAlTrdtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAlTrd = Cypress.moment().format('L LT')    
let startDtintAlTrd = parseInt(startDtAlTrd) 
let endDtdisplayedAlTrd = (Cypress.moment().add(1, 'year').format('L LT'))
let endDtdisplayedAlTrdFr = (Cypress.moment().add(1, 'year').format('DD/MM/YYYY HH:mm'))
const endDtAlTrd = parseInt(Cypress.moment().add(1, 'year').format('x'))
let DateDisplayedAlTrd = "("+ startDtDisAlTrd + " - " + endDtdisplayedAlTrd + ")"
let DateDisplayedAlTrdFr = "("+ startDtDisAlTrdtFr + " - " + endDtdisplayedAlTrdFr + ")"
let processIdAlTrd = "Cy-AlTrd-"+startDtAlTrd
cy.PushCard(processName, publisherV, publisherName, processIdAlTrd, message, 'ALARM', startDtintAlTrd, endDtAlTrd);  
cy.wait(1200) 

//Action Third Card
let startDtAcTrd = Cypress.moment().format('x')
let startDtDisAcTrdtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisAcTrd = Cypress.moment().format('L LT')    
let startDtintAcTrd = parseInt(startDtAcTrd) 
let endDtdisplayedAcTrd = (Cypress.moment().add(1, 'year').format('L LT'))
let endDtdisplayedAcTrdFr = (Cypress.moment().add(1, 'year').format('DD/MM/YYYY HH:mm'))
const endDtAcTrd = parseInt(Cypress.moment().add(1, 'year').format('x'))
let DateDisplayedAcTrd = "("+ startDtDisAcTrd + " - " + endDtdisplayedAcTrd + ")"
let DateDisplayedAcTrdFr = "("+ startDtDisAcTrdtFr + " - " + endDtdisplayedAcTrdFr + ")"
let processIdAcTrd = "Cy-AcTrd-"+startDtAcTrd
cy.PushCard(processName, publisherV, publisherName, processIdAcTrd, message, 'ACTION', startDtintAcTrd, endDtAcTrd);  
cy.wait(1200) 

//Third compliant Card
let startDtCpTrd = Cypress.moment().format('x')
let startDtDisCpTrdtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisCpTrd = Cypress.moment().format('L LT')    
let startDtintCpTrd = parseInt(startDtCpTrd) 
let endDtdisplayedCpTrd = (Cypress.moment().add(1, 'year').format('L LT'))
let endDtdisplayedCpTrdFr = (Cypress.moment().add(1, 'year').format('DD/MM/YYYY HH:mm'))
const endDtCpTrd = parseInt(Cypress.moment().add(1, 'year').format('x'))
let DateDisplayedCpTrd = "("+ startDtDisCpTrd + " - " + endDtdisplayedCpTrd + ")"
let DateDisplayedCpTrdFr = "("+ startDtDisCpTrdtFr + " - " + endDtdisplayedCpTrdFr + ")"
let processIdCpTrd = "Cy-CpTrd-"+startDtCpTrd
cy.PushCard(processName, publisherV, publisherName, processIdCpTrd, message, 'COMPLIANT', startDtintCpTrd, endDtCpTrd);  
cy.wait(1200) 

//Third Card Information
let startDtInTrd = Cypress.moment().format('x')
let startDtDisInTrdtFr = Cypress.moment().format('DD/MM/YYYY HH:mm')
let startDtDisInTrd = Cypress.moment().format('L LT')    
let startDtintInTrd = parseInt(startDtInTrd) 
let endDtdisplayedInTrd = (Cypress.moment().add(1, 'month').format('L LT'))
let endDtdisplayedInTrdFr = (Cypress.moment().add(1, 'month').format('DD/MM/YYYY HH:mm'))
const endDtInTrd = parseInt(Cypress.moment().add(1, 'month').format('x'))
let DateDisplayedInTrd = "("+ startDtDisInTrd + " - " + endDtdisplayedInTrd + ")"
let DateDisplayedInTrdFr = "("+ startDtDisInTrdtFr + " - " + endDtdisplayedInTrdFr + ")"
let processIdInTrd = "Cy-InTrd-"+startDtInTrd
cy.PushCard(processName, publisherV, publisherName, processIdInTrd, message, 'INFORMATION', startDtintInTrd, endDtInTrd);  

})
})
