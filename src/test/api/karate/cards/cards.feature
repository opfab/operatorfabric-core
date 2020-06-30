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
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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
    And match response.count == 1



  Scenario: Post a new version of the card

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1

#get card with user tso1-operator
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'new message'
    And def cardUid = response.uid

    #get card without  authentication
    Given url opfabUrl + 'cards/cards/api_test_process1'
    When method get
    Then status 401


  Scenario: Delete the card

#get card with user tso1-operator
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardUid = response.uid

# delete card
    Given url opfabPublishCardUrl + 'cards/api_test_process1'
    When method delete
    Then status 200


  Scenario: Post two cards in one request

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process2card1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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
	"processId" : "process2card2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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


  Scenario: Post two cards in one request, including one card in wrong format (severity field missing in second card)

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process2CardsIncludingOneCardKO1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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
	"processId" : "process2CardsIncludingOneCardKO2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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
    And match response.count == 0


  Scenario:  Post card with new attribute externalRecipients

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"externalRecipients" : ["api_test2","api_test165"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1

#get card with user tso1-operator and new attribute externalRecipients
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.externalRecipients[1] == "api_test165"
    And def cardUid = response.uid

Scenario:  Post card with no recipient but entityRecipients

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process2",
	"state": "messageState",
	"entityRecipients" : ["TSO1"],
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
    And match response.count == 1

Scenario:  Post card with parentCardId not correct

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"},
	"parentCardId": "1"
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 0
    And match response.message contains "The parentCardId 1 is not the uid of any card"

Scenario:  Post card with correct parentCardId

    #get parent card uid
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardUid = response.card.uid

	* def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* card.parentCardId = cardUid

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1
    And match response.message == "All pushedCards were successfully handled"

Scenario: Push card and its two child cards, then get the parent card

    * def parentCard =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push parent card
    Given url opfabPublishCardUrl + 'cards'
    And request parentCard
    When method post
    Then status 201
    And match response.count == 1
    And match response.message == "All pushedCards were successfully handled"

#get parent card uid
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def parentCardUid = response.card.uid

# Push two child cards
    * def childCard1 =
"""
{
	"publisher" : "api_test",
	"processVersion" :"1",
	"process"  :"api_test",
	"processId" : "processChild1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* childCard1.parentCardId = parentCardUid

	* def childCard2 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processId" : "processChild2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* childCard2.parentCardId = parentCardUid

# Push the two child cards
    Given url opfabPublishCardUrl + 'cards'
    And request childCard1
    When method post
    Then status 201
    And match response.count == 1
    And match response.message == "All pushedCards were successfully handled"

# Push the two child cards
    Given url opfabPublishCardUrl + 'cards'
    And request childCard2
    When method post
    Then status 201
    And match response.count == 1
    And match response.message == "All pushedCards were successfully handled"

# Get the parent card with its two child cards

    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And assert response.childCards.length == 2