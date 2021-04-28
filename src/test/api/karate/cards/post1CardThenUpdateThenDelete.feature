Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post Card

* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
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

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message'
And def cardUid = response.card.uid


#get card from archives with user operator1
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
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
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

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'new message'
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'


Scenario: Delete the card 


#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid

# delete card
Given url opfabPublishCardUrl + 'cards/api_test.process1'
When method delete
Then status 200

#get card with user operator1 should return 404
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 404

#get card from archives with user operator1 is possible
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'
