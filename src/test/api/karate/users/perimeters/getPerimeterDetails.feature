Feature: Get perimeter details (endpoint tested : GET /perimeters/{id})

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining perimeters
    * def perimeter =
"""
{
  "id" : "perimeterKarate3_1",
  "process" : "process3",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "Receive"
      }
  ]
}
"""


    #Create the perimeter
  Scenario: Create the perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201
    And match response.id == perimeter.id
    And match response.process == perimeter.process
    And match response.stateRights == perimeter.stateRights


  Scenario: get perimeter details
    Given url opfabUrl + 'users/perimeters/' + perimeter.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then match response.id == perimeter.id
    And match response.process == perimeter.process
    And match response.stateRights == perimeter.stateRights
    And status 200


  Scenario: get perimeter details without authentication
    Given url opfabUrl + 'users/perimeters/' + perimeter.id
    When method get
    Then status 401


  Scenario: get perimeter details with a simple user
    Given url opfabUrl + 'users/perimeters/' + perimeter.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get nonexistent perimeter details
    Given url opfabUrl + 'users/perimeters/Random'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Perimeter Random not found'