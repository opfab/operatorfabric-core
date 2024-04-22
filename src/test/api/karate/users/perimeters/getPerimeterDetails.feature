Feature: Get perimeter details (endpoint tested : GET /perimeters/{id})

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
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
      "right" : "Receive",
      "filteringNotificationAllowed" : true
      }
  ]
}
"""


    #Create the perimeter
  Scenario: Create the perimeter
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authToken)'}
    Then match result.response.id == perimeter.id
    And match result.response.process == perimeter.process
    And match result.response.stateRights == perimeter.stateRights


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