Feature: deleteUserCards tests

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def groupKarate =
"""
{
  "id" : "groupKarateDeleteUserCards",
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

    * def tso1operatorArray =
"""
[   "tso1-operator"
]
"""
    * def groupArray =
"""
[   "groupKarateDeleteUserCards"
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


  Scenario: Add tso1-operator to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request tso1operatorArray
    When method patch
    And status 200


  Scenario: Create perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post


  Scenario: Put groupKarate for perimeter
    Given url opfabUrl + 'users/perimeters/'+ perimeter.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200


  Scenario: Push user card
    * def cardForDeleteOk =
"""
{
	"publisher" : "ENTITY1",
	"publisherType" : "ENTITY",
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
	"publisherType" : "EXTERNAL",
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
	"publisherType" : "ENTITY",
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
	"publisher" : "ENTITY1",
	"publisherType" : "ENTITY",
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
  Given url opfabPublishCardUrl + 'cards'
  And request cardForDeleteOk
  When method post
  Then status 201
  And match response.count == 1


# Push cardForDeleteForbidden1
  Given url opfabPublishCardUrl + 'cards'
  And request cardForDeleteForbidden1
  When method post
  Then status 201
  And match response.count == 1

# Push cardForDeleteForbidden2
   Given url opfabPublishCardUrl + 'cards'
   And request cardForDeleteForbidden2
   When method post
   Then status 201
   And match response.count == 1


# Push cardForDeleteForbidden3
   Given url opfabPublishCardUrl + 'cards'
   And request cardForDeleteForbidden3
   When method post
   Then status 201
   And match response.count == 1


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