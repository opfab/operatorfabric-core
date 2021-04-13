Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post a big Card

* def card = read("resources/bigCard.json")


# Push a big  card 
Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1


#get card with user operator1
Given url opfabUrl + 'cards/cards/APOGEESEA.SEA0' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200




