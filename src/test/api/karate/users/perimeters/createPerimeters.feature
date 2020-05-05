Feature: CreatePerimeters (endpoint tested : POST /perimeters)

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
  "id" : "perimeterKarate1_1",
  "process" : "process1",
  "state" : "state1",
  "rights" : "Read"
}
"""
    * def perimeterUpdated =
"""
{
  "id" : "perimeterKarate1_1",
  "process" : "process1",
  "state" : "state1",
  "rights" : "ReadAndWrite"
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
    And match response.state == perimeter.state
    And match response.rights == perimeter.rights

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
        #HForbiden without admin role, expected response 403
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