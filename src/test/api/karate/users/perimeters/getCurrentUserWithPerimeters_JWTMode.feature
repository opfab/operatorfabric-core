Feature: Get current user with perimeters (opfab in JWT mode)(endpoint tested : GET /CurrentUserWithPerimeters)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


    * def perimeter15_1_R =
"""
{
  "id" : "perimeterKarate15_1_R",
  "process" : "process15",
  "state" : "state1",
  "rights" : "Read"
}
"""

    * def perimeter15_1_RR =
"""
{
  "id" : "perimeterKarate15_1_RR",
  "process" : "process15",
  "state" : "state1",
  "rights" : "ReadAndRespond"
}
"""

    * def perimeter15_2 =
"""
{
  "id" : "perimeterKarate15_2",
  "process" : "process15",
  "state" : "state2",
  "rights" : "ReadAndWrite"
}
"""
    * def TSO1TSO3groupsArray =
"""
[   "TSO1", "TSO3"
]
"""
    * def TSO3groupsArray =
"""
[   "TSO3"
]
"""
    * def TSO1groupsArray =
"""
[   "TSO1"
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


  Scenario: Create perimeter15_1_R
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_1_R
    When method post
    Then status 201
    And match response.id == perimeter15_1_R.id
    And match response.process == perimeter15_1_R.process
    And match response.state == perimeter15_1_R.state
    And match response.rights == perimeter15_1_R.rights


  Scenario: Create perimeter15_1_RR
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_1_RR
    When method post
    Then status 201
    And match response.id == perimeter15_1_RR.id
    And match response.process == perimeter15_1_RR.process
    And match response.state == perimeter15_1_RR.state
    And match response.rights == perimeter15_1_RR.rights


  Scenario: Create perimeter15_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_2
    When method post
    Then status 201
    And match response.id == perimeter15_2.id
    And match response.process == perimeter15_2.process
    And match response.state == perimeter15_2.state
    And match response.rights == perimeter15_2.rights


  Scenario: Add TSO1 and TSO3 groups to perimeter15_1_R
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1_R.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request TSO1TSO3groupsArray
    When method patch
    And status 200


  Scenario: Add TSO3 group to perimeter15_1_RR
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1_RR.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request TSO3groupsArray
    When method patch
    And status 200


  Scenario: Add TSO1 group to perimeter15_2
    Given url opfabUrl + 'users/perimeters/' + perimeter15_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request TSO1groupsArray
    When method patch
    And status 200


  Scenario: Get current user with perimeters with tso1-operator
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'tso1-operator'
    And assert response.computedPerimeters.length == 2
    And match response.computedPerimeters contains only [{"process":"process15","state":"state1","rights":"ReadAndRespond"}, {"process":"process15","state":"state2","rights":"ReadAndWrite"}]


  Scenario: Delete TSO1 and TSO3 groups from perimeter15_1_R
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1_R.id  + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: Delete TSO3 group from perimeter15_1_RR
    Given url opfabUrl + 'users/perimeters/' + perimeter15_1_RR.id  + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: Delete TSO1 group from perimeter15_2
    Given url opfabUrl + 'users/perimeters/' + perimeter15_2.id  + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200