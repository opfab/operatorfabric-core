Feature: Get perimeters for a group (endpoint tested : GET /groups/{id}/perimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def group12 =
"""
{
  "id" : "groupKarate12",
  "name" : "groupKarate12 name",
  "description" : "groupKarate12 description"
}
"""

    * def perimeter12_1 =
"""
{
  "id" : "perimeterKarate12_1",
  "process" : "process12_1",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "Receive",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""

    * def perimeter12_2 =
"""
{
  "id" : "perimeterKarate12_2",
  "process" : "process12_2",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "ReceiveAndWrite",
      "filteringNotificationAllowed" : true
    }
  ]
}
"""
    * def group12Array =
"""
[   "groupKarate12"
]
"""

  Scenario: Create group12
    Given def result = callonce read('../../common/createGroup.feature') {group: '#(group12)', token: '#(authToken)'}
    Then match result.response.description == group12.description
    And match result.response.name == group12.name
    And match result.response.id == group12.id


  Scenario: Create perimeter12_1
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter12_1)', token: '#(authToken)'}
    Then match result.response.id == perimeter12_1.id
    And match result.response.process == perimeter12_1.process
    And match result.response.stateRights == perimeter12_1.stateRights


  Scenario: Create perimeter12_2
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter12_2)', token: '#(authToken)'}
    Then match result.response.id == perimeter12_2.id
    And match result.response.process == perimeter12_2.process
    And match result.response.stateRights == perimeter12_2.stateRights


  Scenario: Put group12 for perimeter12_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter12_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group12Array
    When method put
    Then status 200


  Scenario: Put group12 for perimeter12_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter12_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group12Array
    When method put
    Then status 200


  Scenario: get all perimeters for group12 without authentication
    Given url opfabUrl + 'users/groups/' + group12.id + '/perimeters'
    When method get
    Then status 401


  Scenario: get all perimeters for group12 with simple user
    # Using TSO user, expected response 403
    Given url opfabUrl + 'users/groups/' + group12.id + '/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get all perimeters for a nonexistent group
    Given url opfabUrl + 'users/groups/unknownGroup/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Group unknownGroup not found'


  Scenario: get all perimeters for group12
    Given url opfabUrl + 'users/groups/' + group12.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 2
    And match response contains only [{"id":"perimeterKarate12_1","process":"process12_1","stateRights":[{"state":"state1","right":"Receive","filteringNotificationAllowed":true}]},{"id":"perimeterKarate12_2","process":"process12_2","stateRights":[{"state":"state1","right":"ReceiveAndWrite","filteringNotificationAllowed":true}]}]
