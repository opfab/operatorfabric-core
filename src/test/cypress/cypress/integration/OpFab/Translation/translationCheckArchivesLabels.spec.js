// The purpose of this test is to check is the labels displayed in archives page are correctly displayed and translated when the language changes
let user='operator1'
let password="test"
var lang
describe ('logging',()=>{
  it('Check current language',()=>{
    //returns the current language if it is not set the test will fail  
      cy.getLang(user,password).then(reponse =>
       {
           if(reponse === 'en')
           {           
               lang=reponse
               cy.log('The current language is '+lang)
           }
           else
           {
           lang=reponse   
           cy.log ('La langue choisie est '+ lang)
           }
       })
    })
  it('login and check archives labels', ()=>{
    
   cy.LogOpFab(user, password)
   cy.wait(500)
   cy.goToArchives()
   cy.wait(500)
   cy.checkArchivesLabels(lang)

   cy.goToSettings()
   cy.wait(500)
   cy.changeLangManually(lang)
   cy.wait(500)
   cy.goToArchives()
   cy.getLang(user,password).then(response =>
    {   
            lang=response
 //check translations for new card           
 cy.checkArchivesLabels(lang)   
    })
     

   })
})