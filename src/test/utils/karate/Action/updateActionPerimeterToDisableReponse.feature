Feature: Update existing perimeter (endpoint tested : PUT /perimeters/{id})

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


    * def perimeterUpdated =
"""
{
  "id" : "perimeterAction",
  "process" : "processAction",
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

  Scenario: Update the perimeter
    #Update the perimeter, expected response 200
    Given url opfabUrl + 'users/perimeters/perimeterAction'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUpdated
    When method put
    Then status 200

