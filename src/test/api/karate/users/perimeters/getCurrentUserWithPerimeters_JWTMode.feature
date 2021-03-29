Feature: Get current user with perimeters (opfab in JWT mode)(endpoint tested : GET /CurrentUserWithPerimeters)

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


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
    }
  ]
}
"""

    * def SupervisorgroupsArray =
"""
[   "Supervisor"
]
"""
    * def DispatchergroupsArray =
"""
[   "Dispatcher"
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


  Scenario: Add Dispatcher group to perimeter15_1
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request DispatchergroupsArray
    When method patch
    And status 200


  Scenario: Add Supervisor group to perimeter15_2
    Given url opfabUrl + 'users/perimeters/' + perimeter15_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request SupervisorgroupsArray
    When method patch
    And status 200


  Scenario: Get current user with perimeters with operator1
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'operator1'
    And assert response.computedPerimeters.length == 2
    And match response.computedPerimeters contains only [{"process":"process15","state":"state1","rights":"ReceiveAndWrite"}, {"process":"process15","state":"state2","rights":"ReceiveAndWrite"}]


  Scenario: Delete Dispatcher group from perimeter15_1
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1.id  + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: Delete Supervisor group from perimeter15_2
    Given url opfabUrl + 'users/perimeters/' + perimeter15_2.id  + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200