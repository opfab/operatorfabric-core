Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post a big Card

* def card = read("resources/bigCard.json")


# Push a big  card 
Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1
And def cardUid = response.uid


#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/APOGEESEA_SEA0' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.uid


#get card from archives with user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200



* def card = read("resources/bigCard2.json")

# Push 2 big Card in one request 
Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 2


