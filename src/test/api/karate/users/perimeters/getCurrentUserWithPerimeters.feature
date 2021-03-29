Feature: Get current user with perimeters (endpoint tested : GET /CurrentUserWithPerimeters)

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def group15 =
"""
{
  "id" : "groupKarate15",
  "name" : "groupKarate15 name",
  "description" : "groupKarate15 description"
}
"""

    * def group16 =
"""
{
  "id" : "groupKarate16",
  "name" : "groupKarate16 name",
  "description" : "groupKarate16 description"
}
"""

    * def perimeter15_1 =
"""
{
  "id" : "perimeterKarate15_1",
  "process" : "process15",
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

    * def perimeter15_2 =
"""
{
  "id" : "perimeterKarate15_2",
  "process" : "process15",
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
    * def group15Array =
"""
[   "groupKarate15"
]
"""
    * def group16Array =
"""
[   "groupKarate16"
]
"""

  Scenario: Get current user with perimeters with operator1
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'operator1'
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


  Scenario: Create group16
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group16
    When method post
    Then status 201
    And match response.description == group16.description
    And match response.name == group16.name
    And match response.id == group16.id


  Scenario: Add operator1 to group15
    Given url opfabUrl + 'users/groups/' + group15.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Add operator1 to group16
    Given url opfabUrl + 'users/groups/' + group16.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
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


  Scenario: Create perimeter15_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_2
    When method post
    Then status 201
    And match response.id == perimeter15_2.id
    And match response.process == perimeter15_2.process
    And match response.stateRights == perimeter15_2.stateRights


  Scenario: Put group15 for perimeter15_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter15_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group15Array
    When method put
    Then status 200


  Scenario: Put group16 for perimeter15_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter15_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group16Array
    When method put
    Then status 200


  Scenario: Get current user with perimeters with operator1
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'operator1'
    And assert response.computedPerimeters.length == 2
    And match response.computedPerimeters contains only [{"process":"process15","state":"state1","rights":"ReceiveAndWrite"}, {"process":"process15","state":"state2","rights":"ReceiveAndWrite"}]


  Scenario: Delete user operator1 from group15
    Given url opfabUrl + 'users/groups/' + group15.id  + '/users/operator1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Delete user operator1 from group16
    Given url opfabUrl + 'users/groups/' + group16.id  + '/users/operator1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200