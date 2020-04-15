Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken
    * def signInAsRteOperator = call read('../common/getToken.feature') { username: 'rte-operator'}
    * def authTokenAsRteOperator = signInAsRteOperator.authToken

  Scenario: Post two cards in one request, using entity recipients

    * def card =
"""
[
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"message (card 1) published for group TSO1 and entities ENTITY1 and ENTITY2"},
	"entityRecipients" : ["ENTITY1", "ENTITY2"]
},
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"message (card 2) published for group TSO1 and entities ENTITY3 and ENTITY4"},
	"entityRecipients" : ["ENTITY3", "ENTITY4"]
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
    Then status 200
    And match response.data.message == 'message (card 1) published for group TSO1 and entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'
    And def cardUid1 = response.uid


  # Get card 2
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_2'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404


  # Get card 1 from archives
    Given url opfabUrl + 'cards/archives/' + cardUid1
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'message (card 1) published for group TSO1 and entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'


  Scenario: Update the second card, removing entity recipients

    * def card =
"""
[
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process2card1Entities_2",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"updated message (card 2) with removed entityRecipients ENTITY3 and ENTITY4"}
}
]
"""

  # Push the card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Get the updated card (get also from archives)

    # Get updated card
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_2'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'updated message (card 2) with removed entityRecipients ENTITY3 and ENTITY4'
    And match response.entityRecipients == null
    And def cardUid2 = response.uid


  # Get updated card from archives
    Given url opfabUrl + 'cards/archives/' + cardUid2
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'updated message (card 2) with removed entityRecipients ENTITY3 and ENTITY4'
    And match response.entityRecipients == null


  Scenario: Post a card for group TRANS and entity ENTITY1

    * def card =
"""
[
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "processToVerifyRoutingForUserWithNoEntity_1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TRANS"
			},
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"message published for group TRANS and entities ENTITY1 and ENTITY2"},
	"entityRecipients" : ["ENTITY1", "ENTITY2"]
}
]
"""

  # Push the card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Get the card but authenticated as rte-operator (who doesn't have any entity)

  # Get card
    Given url opfabUrl + 'cards/cards/api_test_processToVerifyRoutingForUserWithNoEntity_1'
    And header Authorization = 'Bearer ' + authTokenAsRteOperator
    When method get
    Then status 404