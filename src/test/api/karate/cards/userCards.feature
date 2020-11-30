Feature: UserCards tests

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def groupKarate =
"""
{
  "id" : "groupKarate",
  "name" : "groupKarate name",
  "description" : "groupKarate description"
}
"""


    * def perimeter_1 =
"""
{
  "id" : "perimeterKarate_1",
  "process" : "process_1",
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

    * def perimeter_2 =
"""
{
  "id" : "perimeterKarate_2",
  "process" : "process_2",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Write"
      },
      {
        "state" : "state2",
        "right" : "Receive"
      }
  ]
}
"""

    * def operator1Array =
"""
[   "operator1"
]
"""
    * def groupArray =
"""
[   "groupKarate"
]
"""

  Scenario: Create groupKarate
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate
    When method post
    Then match response.description == groupKarate.description
    And match response.name == groupKarate.name
    And match response.id == groupKarate.id


  Scenario: Add operator1 to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Create perimeter_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter_1
    When method post



  Scenario: Create perimeter_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter_2
    When method post



  Scenario: Put groupKarate for perimeter_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200


  Scenario: Put groupKarate for perimeter_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200

  Scenario: Push user card
    * def card =
"""
{
	"publisher" : "initial",
	"processVersion" : "1",
	"process"  :"initial",
	"processInstanceId" : "initialCardProcess",
	"state": "state2",
  "groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
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


#get card with user operator1
    Given url opfabUrl + 'cards/cards/initial.initialCardProcess'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And def cardId = response.card.id
    And def cardUid = response.card.uid


    * def card =
"""
{
	"publisher" : "cardTest2",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_w",
	"state": "state2",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    # Push user card without authentication
    Given url opfabPublishCardUrl + 'cards/userCard'
    And request card
    When method post
    Then status 401


# Push user card with good perimeter ==> ReceiveAndWrite perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count == 1


#get card with user operator1
    Given url opfabUrl + 'cards/cards/process_1.process_id_w'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.publisherType == "ENTITY"


    * def card =
"""
{
	"publisher" : "cardTest2",
	"processVersion" : "1",
	"process"  :"process_2",
	"processInstanceId" : "process_o",
	"state": "state2",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
# Push user card with not authorized perimeter ==> Receive perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count != 1



    * card.parentCardId = cardId
    * card.initialParentCardUid = cardUid
    * card.state = "state1"


# Push user card with good perimeter ==> Write perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count == 1


  Scenario: We update the parent card (which id is : initial.initialCardProcess, with keepChildCards=true), then we check that child card was not deleted
    #get card with user operator1
    Given url opfabUrl + 'cards/cards/initial.initialCardProcess'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And def cardId = response.card.id
    And def cardUid = response.card.uid
    And assert response.childCards.length == 1
    And match response.childCards[0].id == "process_2.process_o"

    * def card =
"""
{
	"publisher" : "initial",
	"processVersion" : "1",
	"process"  :"initial",
	"processInstanceId" : "initialCardProcess",
	"state": "final",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"parent card updated with keepChildCards=true"},
	"keepChildCards" : true
}

"""

# Push card (we update the parent card, which id is : initial.initialCardProcess)
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1

# verify that child card was not deleted after parent card update
    Given url opfabUrl + 'cards/cards/process_2.process_o'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.parentCardId == cardId
    And match response.card.initialParentCardUid == cardUid

# we check that the parent card still has its child card
    Given url opfabUrl + 'cards/cards/initial.initialCardProcess'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.childCards.length == 1
    And match response.childCards[0].id == "process_2.process_o"


  Scenario: We update the parent card (which id is : initial.initialCardProcess, without parameter keepChildCards), then we check that child card was deleted
    * def card =
"""
{
	"publisher" : "initial",
	"processVersion" : "1",
	"process"  :"initial",
	"processInstanceId" : "initialCardProcess",
	"state": "final",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"parent card updated without parameter keepChildCards"}
}

"""

# Push card (we update the parent card, which id is : initial.initialCardProcess)
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1

# verify that child card was deleted after parent card update
    Given url opfabUrl + 'cards/cards/process_2.process_o'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404

# we check that the parent card has no child card anymore
    Given url opfabUrl + 'cards/cards/initial.initialCardProcess'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.childCards.length == 0



  Scenario: We push 2 child cards, then we delete the parent card, then we check that the 2 child cards are deleted
    #get the id of the updated parent card (with user tso1-operator)
    Given url opfabUrl + 'cards/cards/initial.initialCardProcess'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And def cardId = response.card.id
    And def cardUid = response.card.uid

    * def childCard1 =
"""
{
	"publisher" : "cardTest4",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_4",
	"state": "state2",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
    * childCard1.parentCardId = cardId
    * childCard1.initialParentCardUid = cardUid

# Push user card (childCard1) with good perimeter ==> ReceiveAndWrite perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request childCard1
    When method post
    Then status 201
    And match response.count == 1

# We check that the child card exists (childCard1)
    Given url opfabUrl + 'cards/cards/process_1.process_id_4'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.parentCardId == cardId
    And match response.card.initialParentCardUid == cardUid



    * def childCard2 =
"""
{
	"publisher" : "cardTest5",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_5",
	"state": "state2",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
    * childCard2.parentCardId = cardId
    * childCard2.initialParentCardUid = cardUid

# Push user card (childCard2) with good perimeter ==> ReceiveAndWrite perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request childCard2
    When method post
    Then status 201
    And match response.count == 1

# We check that the child card exists (childCard2)
    Given url opfabUrl + 'cards/cards/process_1.process_id_5'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.parentCardId == cardId
    And match response.card.initialParentCardUid == cardUid



# delete parent card
    Given url opfabPublishCardUrl + 'cards/initial.initialCardProcess'
    When method delete
    Then status 200

# verify that the 2 child cards was deleted after parent card deletion

    Given url opfabUrl + 'cards/cards/process_1.process_id_4'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404

    Given url opfabUrl + 'cards/cards/process_1.process_id_5'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404


# delete user from group
  Scenario: Delete user operator1 from groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id  + '/users/operator1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200
