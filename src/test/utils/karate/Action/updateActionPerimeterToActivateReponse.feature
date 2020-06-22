Feature: Update existing perimeter (endpoint tested : PUT /perimeters/{id})

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

           #defining perimeters
    * def perimeter =
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

    * def perimeterUpdated =
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
        "right" : "Write"
      }
  ]
}
"""

    * def perimeterError =
"""
{
  "virtualField" : "virtual"
}
"""

  Scenario: Update the perimeter
    #Update the perimeter, expected response 200
    Given url opfabUrl + 'users/perimeters/' + perimeterUpdated.id
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUpdated
    When method put
    Then status 200
    And match response.id == perimeterUpdated.id
    And match response.process == perimeterUpdated.process
    And match response.stateRights == perimeterUpdated.stateRights

