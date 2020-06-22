Feature: Cards


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTso = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTso = signInAsTso.authToken

    * def perimeter =
"""
{
  "id" : "perimeterKarate1",
  "process" : "process1",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Receive"
      },
      {
        "state" : "state2",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

    * def groupTSO1List =
"""
[
"TSO1"
]
"""

    * def card =
"""
[
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"process1",
	"processId" : "process2card1Entities_1",
	"state": "state1",
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
	"publisherVersion" : "1",
	"process"  :"process1",
	"processId" : "process2card1Entities_2",
	"state": "state2",
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


  Scenario: Create Perimeters
  #Create new perimeter (check if the perimeter already exists otherwise it will return 200)
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201
    And match response.id == perimeter.id
    And match response.process == perimeter.process
    And match response.stateRights == perimeter.stateRights


  Scenario: Put perimeter for TSO1 group
    Given url opfabUrl + 'users/perimeters/'+ perimeter.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupTSO1List
    When method put
    Then status 200


  Scenario: Post two cards in one request, using only entity recipients but with perimeters for the user for this process/state
  # Push the 2 cards
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 2


  Scenario: Get the two cards (get also from archives)
  # Get card 1
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_1'
    And header Authorization = 'Bearer ' + authTokenAsTso
    When method get
    Then status 200
    And match response.data.message == 'message (card 1) published for entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'
    And def cardUid1 = response.uid


  # Get card 2
    Given url opfabUrl + 'cards/cards/api_test_process2card1Entities_2'
    And header Authorization = 'Bearer ' + authTokenAsTso
    When method get
    Then status 200
    And match response.data.message == 'message (card 2) published for entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'
    And def cardUid2 = response.uid


  # Get card 1 from archives
    Given url opfabUrl + 'cards/archives/' + cardUid1
    And header Authorization = 'Bearer ' + authTokenAsTso
    When method get
    Then status 200
    And match response.data.message == 'message (card 1) published for entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'


  # Get card 2 from archives
    Given url opfabUrl + 'cards/archives/' + cardUid2
    And header Authorization = 'Bearer ' + authTokenAsTso
    When method get
    Then status 200
    And match response.data.message == 'message (card 2) published for entities ENTITY1 and ENTITY2'
    And match response.entityRecipients[0] == 'ENTITY1'
    And match response.entityRecipients[1] == 'ENTITY2'


  Scenario: Update the second card with "entityRecipients":["ENTITY4"]

    * def card =
"""
[
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"process1",
	"processId" : "process2card1Entities_2",
	"state": "state2",
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
    And header Authorization = 'Bearer ' + authTokenAsTso
    When method get
    Then status 404