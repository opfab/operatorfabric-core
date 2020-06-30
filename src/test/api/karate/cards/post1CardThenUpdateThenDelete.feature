Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post Card

* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message'
And def cardUid = response.card.uid


#get card from archives with user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message'

Scenario: Post a new version of the Card

* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'new message'
And def cardUid = response.card.uid


#get card from archives with user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'


Scenario: Delete the card 


#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid

# delete card
Given url opfabPublishCardUrl + 'cards/api_test_process1'
When method delete
Then status 200

#get card with user tso1-operator should return 404
Given url opfabUrl + 'cards/cards/api_test_process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 404

#get card from archives with user tso1-operator is possible
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'
