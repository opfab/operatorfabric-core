Feature: Add perimeters for a group (endpoint tested : PATCH /groups/{id}/perimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def group14 =
"""
{
  "id" : "groupKarate14",
  "name" : "groupKarate14 name",
  "description" : "groupKarate14 description"
}
"""

    * def perimeter14_1 =
"""
{
  "id" : "perimeterKarate14_1",
  "process" : "process14_1",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "Receive",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""

    * def perimeter14_2 =
"""
{
  "id" : "perimeterKarate14_2",
  "process" : "process14_2",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "ReceiveAndWrite",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""

    * def perimeter14_1Array =
"""
[   "perimeterKarate14_1"
]
"""
    * def perimeter14_2Array =
"""
[   "perimeterKarate14_2"
]
"""
    * def wrongPerimetersArray =
"""
[   "perimeterKarate14_1", "perimeterKarateNotExisting"
]
"""


  Scenario: Create group14
    Given def result = callonce read('../../common/createGroup.feature') {group: '#(group14)', token: '#(authToken)'}
    Then match result.response.description == group14.description
    And match result.response.name == group14.name
    And match result.response.id == group14.id


  Scenario: Create perimeter14_1
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter14_1)', token: '#(authToken)'}
    Then match result.response.id == perimeter14_1.id
    And match result.response.process == perimeter14_1.process
    And match result.response.stateRights == perimeter14_1.stateRights


  Scenario: Create perimeter14_2
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter14_2)', token: '#(authToken)'}
    Then match result.response.id == perimeter14_2.id
    And match result.response.process == perimeter14_2.process
    And match result.response.stateRights == perimeter14_2.stateRights


  Scenario: Add perimeter14_1 for group14 without authentication
    Given url opfabUrl + 'users/groups/'+ group14.id + '/perimeters'
    And request perimeter14_1Array
    When method patch
    Then status 401


  Scenario: Add perimeter14_1 for group14 with simple user
    Given url opfabUrl + 'users/groups/'+ group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request perimeter14_1Array
    When method patch
    Then status 403


  Scenario: Add perimeter14_1 for a nonexistent group
    Given url opfabUrl + 'users/groups/unknownGroup/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter14_1Array
    When method patch
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Group unknownGroup not found'


  Scenario: Add bad perimeters list for group14 (one perimeter in the list doesn't exist)
    Given url opfabUrl + 'users/groups/' + group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request wrongPerimetersArray
    When method patch
    And status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Bad perimeter list : perimeter perimeterKarateNotExisting not found'


  Scenario: get all perimeters for group14 (should be empty)
    Given url opfabUrl + 'users/groups/' + group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 0


  Scenario: Add perimeter14_1 for group14
    Given url opfabUrl + 'users/groups/'+ group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter14_1Array
    When method patch
    Then status 200


  Scenario: get all perimeters for group14 (there should be only 1 perimeter : "perimeterKarate14_1")
    Given url opfabUrl + 'users/groups/' + group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 1
    And match response contains only [{"id":"perimeterKarate14_1","process":"process14_1","stateRights":[{"state":"state1","right":"Receive","filteringNotificationAllowed":true}]}]


  Scenario: Add perimeter14_2 for group14
    Given url opfabUrl + 'users/groups/'+ group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter14_2Array
    When method patch
    Then status 200


  Scenario: get all perimeters for group14 (there should be 2 perimeters : "perimeterKarate14_1" and "perimeterKarate14_2")
    Given url opfabUrl + 'users/groups/' + group14.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 2
    And match response contains only [{"id":"perimeterKarate14_1","process":"process14_1","stateRights":[{"state":"state1","right":"Receive","filteringNotificationAllowed":true}]}, {"id":"perimeterKarate14_2","process":"process14_2","stateRights":[{"state":"state1","right":"ReceiveAndWrite","filteringNotificationAllowed":true}]}]