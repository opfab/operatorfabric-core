Feature: Cards


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken


  Scenario: Post card, patch card and then delete it.

    * def perimeter =
"""
{
  "id" : "perimeterForPatchCard",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

    * def perimeterArray =
"""
[   "perimeterForPatchCard"
]
"""

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process": "api_test",
	"processInstanceId" : "processForTestingPatch",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    * def cardPatch =
"""
{
	"severity" : "COMPLIANT",
	"data" : {"message":"a new message for patch"},
	"entityRecipients": ["ENTITY1_FR"]
}
"""

# Create new perimeter
    * callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

# Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201
    And def cardUid = response.uid
    And def cardId = response.id

# Patch card with non-existent id
    Given url opfabPublishCardUrl + 'cards/nonExistentId'
    And header Authorization = 'Bearer ' + authToken
    And request cardPatch
    When method patch
    Then status 404

# Patch card
    Given url opfabPublishCardUrl + 'cards/' + cardId
    And header Authorization = 'Bearer ' + authToken
    And request cardPatch
    When method patch
    Then status 200

# Get card with user operator1_fr
    Given url opfabUrl + 'cards-consultation/cards/api_test.processForTestingPatch'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.severity == 'COMPLIANT'
    And match response.card.data.message == 'a new message for patch'
    And assert response.card.entityRecipients.length == 1
    And match response.card.entityRecipients[0] == 'ENTITY1_FR'
    And match response.card.publisher == 'operator1_fr'
    And match response.card.title.key == 'defaultProcess.title'
    And match response.card.startDate == 1553186770681

    * def cardPatch =
"""
{
    "severity" : "ALARM",
    "process" : "aDifferentProcess"
}
"""

# Patch card with a different process
    Given url opfabPublishCardUrl + 'cards/' + cardId
    And header Authorization = 'Bearer ' + authToken
    And request cardPatch
    When method patch
    Then status 400
    And match response.message contains "Constraint violation in the request"
    And match response.errors[0] contains "The current process field api_test can not be patched with new value aDifferentProcess"

   * def cardPatch =
"""
{
    "severity" : "ALARM",
    "processInstanceId" : "aDifferentProcessInstanceId"
}
"""

# Patch card with a different processInstanceId
      Given url opfabPublishCardUrl + 'cards/' + cardId
      And header Authorization = 'Bearer ' + authToken
      And request cardPatch
      When method patch
      Then status 400
      And match response.message contains "Constraint violation in the request"
      And match response.errors[0] contains "The current processInstanceId field processForTestingPatch can not be patched with new value aDifferentProcessInstanceId"

# Delete card
      Given url opfabPublishCardUrl + 'cards/' + cardId
      And header Authorization = 'Bearer ' + authToken
      When method delete
      Then status 200

# Delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
