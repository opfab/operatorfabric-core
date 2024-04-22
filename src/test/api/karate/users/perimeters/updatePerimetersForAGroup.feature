Feature: Update perimeters for a group (endpoint tested : PUT /groups/{id}/perimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def group13 =
"""
{
  "id" : "groupKarate13",
  "name" : "groupKarate13 name",
  "description" : "groupKarate13 description"
}
"""

    * def perimeter13_1 =
"""
{
  "id" : "perimeterKarate13_1",
  "process" : "process13",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "Receive",
      "filteringNotificationAllowed" : true
    },
    {
      "state" : "state2",
      "right" : "ReceiveAndWrite",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""

    * def perimeter13_2 =
"""
{
  "id" : "perimeterKarate13_2",
  "process" : "process13",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "ReceiveAndWrite",
      "filteringNotificationAllowed" : true
    },
    {
      "state" : "state2",
      "right" : "ReceiveAndWrite",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""

    * def perimeter13_1Array =
"""
[   "perimeterKarate13_1"
]
"""
    * def perimeter13_2Array =
"""
[   "perimeterKarate13_2"
]
"""
    * def wrongPerimetersArray =
"""
[   "perimeterKarate13_1", "perimeterKarateNotExisting"
]
"""


  Scenario: Create group13
    Given def result = callonce read('../../common/createGroup.feature') {group: '#(group13)', token: '#(authToken)'}
    Then match result.response.description == group13.description
    And match result.response.name == group13.name
    And match result.response.id == group13.id


  Scenario: Create perimeter13_1
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter13_1)', token: '#(authToken)'}
    Then match result.response.id == perimeter13_1.id
    And match result.response.process == perimeter13_1.process
    And match result.response.stateRights == perimeter13_1.stateRights


  Scenario: Create perimeter13_2
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter13_2)', token: '#(authToken)'}
    Then match result.response.id == perimeter13_2.id
    And match result.response.process == perimeter13_2.process
    And match result.response.stateRights == perimeter13_2.stateRights


  Scenario: Put perimeter13_1 for group13 without authentication
    Given url opfabUrl + 'users/groups/'+ group13.id + '/perimeters'
    And request perimeter13_1Array
    When method put
    Then status 401


  Scenario: Put perimeter13_1 for group13 with simple user
    Given url opfabUrl + 'users/groups/'+ group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request perimeter13_1Array
    When method put
    Then status 403


  Scenario: Put perimeter13_1 for a nonexistent group
    Given url opfabUrl + 'users/groups/unknownGroup/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter13_1Array
    When method put
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Group unknownGroup not found'


  Scenario: Put bad perimeters list for group13 (one perimeter in the list doesn't exist)
    Given url opfabUrl + 'users/groups/' + group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request wrongPerimetersArray
    When method put
    And status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Bad perimeter list : perimeter perimeterKarateNotExisting not found'


  Scenario: get all perimeters for group13 (should be empty)
    Given url opfabUrl + 'users/groups/' + group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 0


  Scenario: Put perimeter13_1 for group13
    Given url opfabUrl + 'users/groups/'+ group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter13_1Array
    When method put
    Then status 200


  Scenario: get all perimeters for group13
    Given url opfabUrl + 'users/groups/' + group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 1
    And match response contains only [{"id":"perimeterKarate13_1","process":"process13","stateRights":[{"state":"state1","right":"Receive","filteringNotificationAllowed":true},{"state":"state2","right":"ReceiveAndWrite","filteringNotificationAllowed":true}]}]


  Scenario: Put perimeter13_2 for group13
    Given url opfabUrl + 'users/groups/'+ group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter13_2Array
    When method put
    Then status 200


  Scenario: get all perimeters for group13
    Given url opfabUrl + 'users/groups/' + group13.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 1
    And match response contains only [{"id":"perimeterKarate13_2","process":"process13","stateRights":[{"state":"state1","right":"ReceiveAndWrite","filteringNotificationAllowed":true},{"state":"state2","right":"ReceiveAndWrite","filteringNotificationAllowed":true}]}]