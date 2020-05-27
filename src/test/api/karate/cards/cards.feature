Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
    And match response.data.message == 'new message'
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
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
	"publisher" : "api_testExternalRecipients1",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
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
    Given url opfabUrl + 'cards/cards/api_testExternalRecipients1_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.externalRecipients[1] == "api_test165"
    And def cardUid = response.uid