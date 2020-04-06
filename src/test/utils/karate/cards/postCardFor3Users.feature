Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post Card

* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process3users",
	"state": "messageState",
	"recipient": {
				"type":"UNION",
				"recipients":[
					{ "type": "USER", "identity":"tso1-operator"},
					{ "type": "USER", "identity":"tso2-operator"},
					{ "type": "USER", "identity":"admin"}
				]
		},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message for 3 users (tso1-operator, tso2-operator and admin)"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process3users' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message for 3 users (tso1-operator, tso2-operator and admin)'
And def cardUid = response.uid


#get card form archives with  user tso1-operator 
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message for 3 users (tso1-operator, tso2-operator and admin)'

