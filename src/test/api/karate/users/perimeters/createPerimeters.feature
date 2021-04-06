Feature: CreatePerimeters (endpoint tested : POST /perimeters)

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
      #defining perimeters
    * def perimeter =
"""
{
  "id" : "perimeterKarate1_1",
  "process" : "process1",
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
    * def perimeterUpdated =
"""
{
  "id" : "perimeterKarate1_1",
  "process" : "process1",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""
    * def wrongPerimeter =
"""
{
  "process" : "state999",
}
"""


  Scenario: Create Perimeters
  #Create new perimeter (check if the perimeter already exists otherwise it will return 200)
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201
    And match response.id == perimeter.id
    And match response.process == perimeter.process
    And match response.stateRights == perimeter.stateRights


  Scenario: Try to update my perimeter (must return error 400 - duplicate key)
  #Expected response 400
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUpdated
    When method post
    Then status 400
    And match response.message == 'Resource creation failed because a resource with the same key already exists.'
    And match response.errors[0] == 'Duplicate key : ' + perimeterUpdated.id


  Scenario: create without admin role
  #Forbidden without admin role, expected response 403
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request perimeter
    When method post
    Then status 403


  Scenario: Update without authentication token
  #Witout authentication
    Given url opfabUrl + 'users/perimeters'
    And request perimeter
    When method post
    Then status 401


  Scenario: error 400
  #Create new perimeter with bad request
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request wrongPerimeter
    When method post
    Then status 400