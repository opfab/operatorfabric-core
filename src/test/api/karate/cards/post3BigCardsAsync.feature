Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post a big Card

* def card = read("resources/bigCard.json")


# Push a big  card 
Given url opfabPublishCardUrl + 'async/cards' 
And request card  
When method post
Then status 202



* def card = read("resources/bigCard2.json")

# Push 2 big Card in one request 
Given url opfabPublishCardUrl + 'async/cards' 
And request card  
When method post
Then status 202


