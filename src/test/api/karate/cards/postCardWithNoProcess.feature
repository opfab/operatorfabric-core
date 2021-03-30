Feature: Cards


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "process1WithNoProcessField",
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
    And match response.count == 0
