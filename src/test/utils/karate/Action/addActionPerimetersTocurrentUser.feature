Feature: addActionPerimetersTocurrentUser

#Get current user with perimeters (endpoint tested : GET /CurrentUserWithPerimeters)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def group15 =
"""
{
  "id" : "groupKarate15",
  "name" : "groupKarate15 name",
  "description" : "groupKarate15 description"
}
"""
    * def perimeter15_1 =
"""
{
  "id" : "perimeterKarate15_1",
  "process" : "process",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Receive"
      },
      {
        "state" : "responseState",
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
    * def group15Array =
"""
[   "groupKarate15"
]
"""

  Scenario: Get current user with perimeters with tso1-operator
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'tso1-operator'
    And assert response.computedPerimeters.length == 0


  Scenario: get current user with perimeters without authentication
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    When method get
    Then status 401


  Scenario: Create group15
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group15
    When method post
    Then status 201
    And match response.description == group15.description
    And match response.name == group15.name
    And match response.id == group15.id

  Scenario: Add tso1-operator to group15
    Given url opfabUrl + 'users/groups/' + group15.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request tso1operatorArray
    When method patch
    And status 200

  Scenario: Create perimeter15_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_1
    When method post
    Then status 201
    And match response.id == perimeter15_1.id
    And match response.process == perimeter15_1.process
    And match response.stateRights == perimeter15_1.stateRights

  Scenario: Put group15 for perimeter15_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter15_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group15Array
    When method put
    Then status 200

  Scenario: Get current user with perimeters with tso1-operator
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'tso1-operator'
    And assert response.computedPerimeters.length == 2
    And match response.computedPerimeters contains only [{"process":"process","state":"state1","rights":"Receive"}, {"process":"process","state":"responseState","rights":"Receive"}]