Feature: deletePerimeter

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    # defining perimeter to create
    * def perimeterForEndpointDeletePerimeter =
"""
{
  "id" : "perimeterForEndpointDeletePerimeter",
  "process" : "processForEndpointDeletePerimeter",
  "stateRights" : [
      {
        "state" : "stateForEndpointDeletePerimeter",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""


  Scenario: Delete perimeter for a non-existent perimeter, expected response 404
    Given url opfabUrl + 'users/perimeters/NonExistentPerimeter'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  # then we create a new perimeter who will be deleted
  Scenario: create a new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterForEndpointDeletePerimeter
    When method post
    Then status 201
    And match response.id == perimeterForEndpointDeletePerimeter.id
    And match response.process == perimeterForEndpointDeletePerimeter.process
    And match response.stateRights == perimeterForEndpointDeletePerimeter.stateRights


  Scenario: we check that the perimeter created previously exists
    Given url opfabUrl + 'users/perimeters/' + perimeterForEndpointDeletePerimeter.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: delete perimeter with no authentication, expected response 401
    Given url opfabUrl + 'users/perimeters/' + perimeterForEndpointDeletePerimeter.id
    When method delete
    Then status 401


  Scenario: delete perimeter with no admin authentication (with operator1 authentication), expected response 403
    Given url opfabUrl + 'users/perimeters/' + perimeterForEndpointDeletePerimeter.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete perimeter (with admin authentication), expected response 200
    Given url opfabUrl + 'users/perimeters/' + perimeterForEndpointDeletePerimeter.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: we check that the perimeter doesn't exist anymore, expected response 404
    Given url opfabUrl + 'users/perimeters/' + perimeterForEndpointDeletePerimeter.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404