Feature: Cards routing


Background: 

  * def signInTso1 = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authTokenTso1 = signInTso1.authToken
  * def signInTso2 = call read('../common/getToken.feature') { username: 'tso2-operator'}
  * def authTokenTso2 = signInTso2.authToken


Scenario: Post Card only for group TSO1

* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message for group TSO1"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test.process2' 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.card.data.message == 'a message for group TSO1'
And def cardUid = response.card.uid


#get card from archives with  user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for group TSO1'


#get card with user tso2-operator should not be possible
Given url opfabUrl + 'cards/cards/api_test.process2' 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 404


#get card from archives with user tso2-operator should not be possible
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 404



Scenario: Post Card for groups TSO1 and TSO2

* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2tso",
	"state": "messageState",
	"recipient": {
				"type":"UNION",
				"recipients":[
					{ "type": "GROUP", "identity":"TSO1"},
					{ "type": "GROUP", "identity":"TSO2"}
				]
		},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message for groups TSO1 and TSO2"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test.process2tso' 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.card.data.message == 'a message for groups TSO1 and TSO2'
And def cardUid = response.card.uid


#get card from archives with user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for groups TSO1 and TSO2'


#get card with user tso2-operator should be possible
Given url opfabUrl + 'cards/cards/api_test.process2tso' 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 200
And match response.card.data.message == 'a message for groups TSO1 and TSO2'
And def cardUid = response.card.uid


#get card from archives with user tso2-operator should be possible
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 200
And match response.data.message == 'a message for groups TSO1 and TSO2'
