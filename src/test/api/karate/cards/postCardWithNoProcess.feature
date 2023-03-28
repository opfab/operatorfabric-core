Feature: Cards


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "operator1_fr",
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
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Constraint violation in the request'
    And match response.errors[0] contains "process: must not be null"
