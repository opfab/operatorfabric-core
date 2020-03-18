Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Check Archives / must insert 10 cards first with other scenarios


#get cards form archives with  user tso1-operator 
Given url opfabUrl + 'cards/archives/?size=10&page=0' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.size == 10
And match response.totalPages == '#?  response.totalPages > 1'
And match response.totalElements == '#?  response.totalElements > 10'

