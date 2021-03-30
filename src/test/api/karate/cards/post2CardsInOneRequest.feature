Feature: Cards


Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken

Scenario: Post two  Cards in one request

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 1)"}
},
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
]
"""

# Push card
Given url opfabPublishCardUrl + 'cards'
And request card
When method post
Then status 201
And match response.count == 2
