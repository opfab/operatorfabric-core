Feature: Cards routing


Background: 

  * def signInTso1 = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authTokenTso1 = signInTso1.authToken
  * def signInTso2 = call read('../common/getToken.feature') { username: 'tso2-operator'}
  * def authTokenTso2 = signInTso2.authToken


Scenario: Post Card only for tso1

* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message for tso1"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process2' 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for tso1'
And def cardUid = response.uid


#get card form archives with  user tso1-operator 
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for tso1'


#get card with user tso2-operator should not be possible
Given url opfabUrl + 'cards/cards/api_test_process2' 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 404


#get card form archives with  user tso2-operator should not be possible 
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 404



Scenario: Post Card for tso1 and tso2

* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2tso",
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
	"data" : {"message":"a message for tso1"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test_process2tso' 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for tso1'
And def cardUid = response.uid


#get card form archives with  user tso1-operator 
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso1 
When method get
Then status 200
And match response.data.message == 'a message for tso1'


#get card with user tso2-operator should be possible
Given url opfabUrl + 'cards/cards/api_test_process2tso' 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 200


#get card form archives with  user tso2-operator should be possible 
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authTokenTso2 
When method get
Then status 200