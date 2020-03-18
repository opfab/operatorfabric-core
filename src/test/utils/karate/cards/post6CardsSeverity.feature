Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post 6 Cards (2 INFORMATION, 1 COMPLIANT, 1 ACTION, 2 ALARM)


# Push an information card 
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
	"data" : {"message":" Information card number 1"},
	"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""


Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1


# Push a second information card 
* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2b",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":" Information card number 2"},
	"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""


Given url opfabPublishCardUrl + 'cards' 

And request card  
When method post
Then status 201
And match response.count == 1


# Push a compliant card 
* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process3",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":" Question card"},
	"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""


Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1


# Push an action card 
* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process4",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "ACTION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":" Action card"},
	"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""

 
Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1

# Push an alarm card
* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process5",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "ALARM",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"First Alarm card"},
	,
		"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""


Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1

# Push an second  alarm card later 
* def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process5b",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "ALARM",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"Second Alarm card"},
	,
		"timeSpans" : [
        {"start" : 1580055306000},
        {"start" : 1580141706000}
    	]
}
"""


Given url opfabPublishCardUrl + 'cards' 
And request card  
When method post
Then status 201
And match response.count == 1
