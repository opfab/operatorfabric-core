Feature: CreatePerimeters (endpoint tested : POST /perimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    # defining perimeters
    # state3 of perimeterKarate1_1 has no value for filteringNotificationAllowed to test default value is set to true
    * def perimeter =
"""
{
  "id" : "perimeterKarate1_1",
  "process" : "process1",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Receive",
        "filteringNotificationAllowed" : true
      },
      {
        "state" : "state2",
        "right" : "ReceiveAndWrite",
        "filteringNotificationAllowed" : false
      },
      {
        "state" : "state3",
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

    * def perimeterToTestBadRequest0 =
"""
{
   "id" : "",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterToTestBadRequest1 =
"""
{
   "id" : "a",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterToTestBadRequest2 =
"""
{
   "id" : "aé",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterToTestBadRequest3 =
"""
{
   "id" : "é",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterWithValidIdFormat0 =
"""
{
   "id" : "validId",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterWithValidIdFormat1 =
"""
{
   "id" : "valid_id",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterWithValidIdFormat2 =
"""
{
   "id" : "valid-id",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

    * def perimeterWithValidIdFormat3 =
"""
{
   "id" : "validId_with-digit_0",
   "name" : "perimeter name",
   "description" : "perimeter description"
}
"""

  Scenario: Create Perimeters
  #Create new perimeter (check if the perimeter already exists otherwise it will return 200)
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authToken)'}
    Then match result.response.id == perimeter.id
    And match result.response.process == perimeter.process
    And match result.response.stateRights[0] == perimeter.stateRights[0]
    And match result.response.stateRights[1] == perimeter.stateRights[1]
    And match result.response.stateRights[2].state == perimeter.stateRights[2].state
    And match result.response.stateRights[2].right == perimeter.stateRights[2].right
    And match result.response.stateRights[2].filteringNotificationAllowed == true


  Scenario: Try to update existing perimeter
  #Expected response 400
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUpdated
    When method post
    Then status 400
    And match response.message == 'Creation failed because perimeter perimeterKarate1_1 already exist'


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


  Scenario Outline: Bad request
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request <perimeterToTestBadRequest>
    When method post
    Then status 400
    And match response.status == "BAD_REQUEST"
    And match response.message == <expectedMessage>

    Examples:
      | perimeterToTestBadRequest  | expectedMessage                                                                                                             |
      | perimeterToTestBadRequest0 | "Id is required."                                                                                                           |
      | perimeterToTestBadRequest1 | "Id should be minimum 2 characters (id=a)."                                                                                 |
      | perimeterToTestBadRequest2 | "Id should only contain the following characters: letters, _, - or digits (id=aé)."                                         |
      | perimeterToTestBadRequest3 | "Id should be minimum 2 characters (id=é).Id should only contain the following characters: letters, _, - or digits (id=é)." |


  Scenario Outline: Create perimeter with valid id format
    Given def result = callonce read('../../common/createPerimeter.feature') {perimeter: '#(<perimeterWithValidIdFormat>)', token: '#(authToken)'}
    And match result.response.id == <expectedPerimeterId>

    Examples:
      | perimeterWithValidIdFormat  | expectedPerimeterId            |
      | perimeterWithValidIdFormat0 | perimeterWithValidIdFormat0.id |
      | perimeterWithValidIdFormat1 | perimeterWithValidIdFormat1.id |
      | perimeterWithValidIdFormat2 | perimeterWithValidIdFormat2.id |
      | perimeterWithValidIdFormat3 | perimeterWithValidIdFormat3.id |


  Scenario Outline: we delete the perimeters previously created
    callonce read('../../common/deletePerimeter.feature') {perimeterId: '#(<perimeterId>)', token: '#(authToken)'}

    Examples:
      | perimeterId  |
      | perimeterWithValidIdFormat0.id |
      | perimeterWithValidIdFormat1.id |
      | perimeterWithValidIdFormat2.id |
      | perimeterWithValidIdFormat3.id |