Feature: deleteUserCards tests

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsTSO2 = callonce read('../common/getToken.feature') { username: 'operator2'}
    * def authTokenAsTSO2 = signInAsTSO2.authToken

    * def groupKarate =
"""
{
  "id" : "groupKarateDeleteUserCards",
  "name" : "groupKarate name",
  "description" : "groupKarate description"
}
"""
    * def groupKarate2 =
"""
{
  "id" : "groupKarateDeleteUserCards2",
  "name" : "groupKarate name",
  "description" : "groupKarate description"
}
"""


    * def perimeter =
"""
{
  "id" : "perimeterKarateDeleteUserCards",
  "process" : "processDeleteUserCard",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "ReceiveAndWrite"
      },
      {
        "state" : "state2",
        "right" : "Receive"
      }
  ]
}
"""

    * def perimeterWriteForState2 =
"""
{
  "id" : "perimeterKarateDeleteUserCards2",
  "process" : "processDeleteUserCard",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Write"
      },
      {
        "state" : "state2",
        "right" : "Write"
      }
  ]
}
"""

    * def operator1Array =
"""
[   "operator1"
]
"""
    * def operator2Array =
"""
[   "operator2"
]
"""
    * def groupArray =
"""
[   "groupKarateDeleteUserCards"
]
"""
    * def group2Array =
"""
[   "groupKarateDeleteUserCards2"
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

  Scenario: Create groupKarate2
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate2
    When method post
    Then match response.description == groupKarate2.description
    And match response.name == groupKarate2.name
    And match response.id == groupKarate2.id


  Scenario: Add operator1 to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200

  Scenario: Add operator2 to groupKarate2
    Given url opfabUrl + 'users/groups/' + groupKarate2.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator2Array
    When method patch
    And status 200


  Scenario: Create perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post

  Scenario: Create perimeterWriteForState2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterWriteForState2
    When method post


  Scenario: Put groupKarate for perimeter
    Given url opfabUrl + 'users/perimeters/'+ perimeter.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200

  Scenario: Put groupKarate2 for perimeterWriteForState2
    Given url opfabUrl + 'users/perimeters/'+ perimeterWriteForState2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group2Array
    When method put
    Then status 200


  Scenario: Push user card
    * def cardForDeleteOk =
"""
{
	"publisher" : "ENTITY1",
	"processVersion" : "1",
	"process"  :"processDeleteUserCard",
	"processInstanceId" : "processDeleteUserCardOk",
	"state": "state1",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""

    * def cardForDeleteForbidden1 =
"""
{
	"publisher" : "publisherKarate",
	"processVersion" : "1",
	"process"  :"processDeleteUserCard",
	"processInstanceId" : "processDeleteUserCardForbidden1",
	"state": "state1",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""

    * def cardForDeleteForbidden2 =
"""
{
	"publisher" : "ENTITY2",
	"processVersion" : "1",
	"process"  :"processDeleteUserCard",
	"processInstanceId" : "processDeleteUserCardForbidden2",
	"state": "state1",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""

    * def cardForDeleteForbidden3 =
"""
{
	"publisher" : "ENTITY2",
	"processVersion" : "1",
	"process"  :"processDeleteUserCard",
	"processInstanceId" : "processDeleteUserCardForbidden3",
	"state": "state2",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""

# Push cardForDeleteOk
  Given url opfabPublishCardUrl + 'cards/userCard'
  And header Authorization = 'Bearer ' + authTokenAsTSO
  And request cardForDeleteOk
  When method post
  Then status 201


# Push cardForDeleteForbidden1
  Given url opfabPublishCardUrl + 'cards'
  And request cardForDeleteForbidden1
  When method post
  Then status 201

# Push cardForDeleteForbidden2
   Given url opfabPublishCardUrl + 'cards/userCard'
   And header Authorization = 'Bearer ' + authTokenAsTSO2
   And request cardForDeleteForbidden2
   When method post
   Then status 201


# Push cardForDeleteForbidden3
   Given url opfabPublishCardUrl + 'cards/userCard'
   And header Authorization = 'Bearer ' + authTokenAsTSO2
   And request cardForDeleteForbidden3
   When method post
   Then status 201


  Scenario: delete user card with no authentication, expected response 401
    Given url opfabPublishCardUrl + 'cards/userCard/processDeleteUserCard.processDeleteUserCardOk'
    When method delete
    Then status 401


  Scenario: Delete user card for a non-existent card, expected response 404
    Given url opfabPublishCardUrl + 'cards/userCard/NonExistentUserCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 404


  Scenario: delete card not published by an entity, expected response 403
    Given url opfabPublishCardUrl + 'cards/userCard/processDeleteUserCard.processDeleteUserCardForbidden1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete user card not published by an entity of the user, expected response 403
    Given url opfabPublishCardUrl + 'cards/userCard/processDeleteUserCard.processDeleteUserCardForbidden2'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete user card with no Write access for process/state for the user, expected response 403
    Given url opfabPublishCardUrl + 'cards/userCard/processDeleteUserCard.processDeleteUserCardForbidden3'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete user card, expected response 200
    Given url opfabPublishCardUrl + 'cards/userCard/processDeleteUserCard.processDeleteUserCardOk'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 200


  Scenario: delete the perimeter previously created
    Given url opfabUrl + 'users/perimeters/' + perimeter.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: delete the group previously created
    Given url opfabUrl + 'users/groups/' + groupKarate.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: delete cardForDeleteForbidden1
    Given url opfabPublishCardUrl + 'cards/processDeleteUserCard.processDeleteUserCardForbidden1'
    When method delete
    Then status 200


  Scenario: delete cardForDeleteForbidden2
    Given url opfabPublishCardUrl + 'cards/processDeleteUserCard.processDeleteUserCardForbidden2'
    When method delete
    Then status 200


  Scenario: delete cardForDeleteForbidden3
    Given url opfabPublishCardUrl + 'cards/processDeleteUserCard.processDeleteUserCardForbidden3'
    When method delete
    Then status 200