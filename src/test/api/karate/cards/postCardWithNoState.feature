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
	"process"  :"defaultProcess",
	"processInstanceId" : "process1WithNoStateField",
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

