Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken

  Scenario: Post two cards in one request, using only entity recipients

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_1",
	"state": "messageState",
	"recipient" : {
				"type" : "USER"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"message (card 1) published for entities ENTITY1 and ENTITY2"},
	"entityRecipients" : ["ENTITY1", "ENTITY2"]
},
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_2",
	"state": "messageState",
	"recipient" : {
				"type" : "USER"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"message (card 2) published for entities ENTITY1 and ENTITY2"},
	"entityRecipients" : ["ENTITY1", "ENTITY2"]
}
]
"""

  # Push the 2 cards
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 2


  Scenario: Get the two cards (get also from archives)

  # Get card 1
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404


  # Get card 2
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_2'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404


  Scenario: Update the second card with "entityRecipients":["ENTITY4"]

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_2",
	"state": "messageState",
	"recipient" : {
				"type" : "USER"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"updated message (card 2), now entityRecipients is only ENTITY4"},
	"entityRecipients" : ["ENTITY4"]
}
]
"""

    # Push the card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Get the updated card

    # Get updated card
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_2'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404
