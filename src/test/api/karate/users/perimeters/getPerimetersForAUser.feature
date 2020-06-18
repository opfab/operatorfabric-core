Feature: Get perimeters for a user (endpoint tested : GET /users/{login}/perimeters)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def user10 =
"""
{
   "login" : "loginKarate10",
   "firstName" : "loginKarate10 firstName",
   "lastName" : "loginKarate10 lastName"
}
"""

    * def group10 =
"""
{
  "id" : "groupKarate10",
  "name" : "groupKarate10 name",
  "description" : "groupKarate10 description"
}
"""

    * def group11 =
"""
{
  "id" : "groupKarate11",
  "name" : "groupKarate11 name",
  "description" : "groupKarate11 description"
}
"""

    * def perimeter10_1 =
"""
{
  "id" : "perimeterKarate10_1",
  "process" : "process10",
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

    * def perimeter10_2 =
"""
{
  "id" : "perimeterKarate10_2",
  "process" : "process10",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "state2",
      "right" : "ReceiveAndWrite"
    }
  ]
}
"""
    * def user10Array =
"""
[   "loginKarate10"
]
"""
    * def group10Array =
"""
[   "groupKarate10"
]
"""
    * def group11Array =
"""
[   "groupKarate11"
]
"""

  Scenario: Create user10
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request user10
    When method post
    Then status 201
    And match response.login == user10.login
    And match response.firstName == user10.firstName
    And match response.lastName == user10.lastName


  Scenario: Create group10
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group10
    When method post
    Then status 201
    And match response.description == group10.description
    And match response.name == group10.name
    And match response.id == group10.id


  Scenario: Create group11
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group11
    When method post
    Then status 201
    And match response.description == group11.description
    And match response.name == group11.name
    And match response.id == group11.id


  Scenario: Add user10 to group10
    Given url opfabUrl + 'users/groups/' + group10.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request user10Array
    When method patch
    And status 200


  Scenario: Add user10 to group11
    Given url opfabUrl + 'users/groups/' + group11.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request user10Array
    When method patch
    And status 200


  Scenario: Create perimeter10_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter10_1
    When method post
    Then status 201
    And match response.id == perimeter10_1.id
    And match response.process == perimeter10_1.process
    And match response.stateRights contains only perimeter10_1.stateRights


  Scenario: Create perimeter10_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter10_2
    When method post
    Then status 201
    And match response.id == perimeter10_2.id
    And match response.process == perimeter10_2.process
    And match response.stateRights contains only perimeter10_2.stateRights


  Scenario: Put group10 for perimeter10_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter10_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group10Array
    When method put
    Then status 200


  Scenario: Put group11 for perimeter10_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter10_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group11Array
    When method put
    Then status 200


  Scenario: get all perimeters for user10 without authentication
    Given url opfabUrl + 'users/users/' + user10.login + '/perimeters'
    When method get
    Then status 401


  Scenario: get all perimeters for user10 with simple user
    #   Using TSO user,  expected response 403
    Given url opfabUrl + 'users/users/' + user10.login + '/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get all perimeters for a nonexistent user
    Given url opfabUrl + 'users/users/unknownUser/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'User unknownUser not found'


  Scenario: get all perimeters for user10
    Given url opfabUrl + 'users/users/' + user10.login + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 2
    And match response contains perimeter10_1
    And match response contains perimeter10_2