Feature: Add perimeters for a group (endpoint tested : PATCH /groups/{id}/perimeters)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
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
      "right" : "Receive"
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
      "right" : "ReceiveAndWrite"
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
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group14
    When method post
    Then status 201
    And match response.description == group14.description
    And match response.name == group14.name
    And match response.id == group14.id


  Scenario: Create perimeter14_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter14_1
    When method post
    Then status 201
    And match response.id == perimeter14_1.id
    And match response.process == perimeter14_1.process
    And match response.stateRights == perimeter14_1.stateRights


  Scenario: Create perimeter14_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter14_2
    When method post
    Then status 201
    And match response.id == perimeter14_2.id
    And match response.process == perimeter14_2.process
    And match response.stateRights == perimeter14_2.stateRights


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
    And match response contains only [{"id":"perimeterKarate14_1","process":"process14_1","stateRights":[{"state":"state1","right":"Receive"}]}]


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
    And match response contains only [{"id":"perimeterKarate14_1","process":"process14_1","stateRights":[{"state":"state1","right":"Receive"}]}, {"id":"perimeterKarate14_2","process":"process14_2","stateRights":[{"state":"state1","right":"ReceiveAndWrite"}]}]