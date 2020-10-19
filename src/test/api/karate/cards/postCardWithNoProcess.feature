Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "process1WithNoProcessField",
	"state": "messageState",
	"groupRecipients": ["TSO1"],
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
