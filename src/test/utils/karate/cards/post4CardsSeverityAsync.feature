Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post 4 Cards in asynchronous mode


# Push an information card 
* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
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
	"data" : {"message":" Information card"},
	"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""



Given url opfabPublishCardUrl + 'async/cards' 

And request card  
When method post
Then status 202


# Push a compliant card 
* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
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


Given url opfabPublishCardUrl + 'async/cards' 
And request card  
When method post
Then status 202


# Push an action card 
* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
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

 
Given url opfabPublishCardUrl + 'async/cards' 
And request card  
When method post
Then status 202


# Push an alarm card
* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
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
	"data" : {"message":"Alarm card"},
	,
		"timeSpans" : [
        {"start" : 1579952678000},
        {"start" : 1580039078000}
    	]
}
"""



Given url opfabPublishCardUrl + 'async/cards' 
And request card  
When method post
Then status 202
