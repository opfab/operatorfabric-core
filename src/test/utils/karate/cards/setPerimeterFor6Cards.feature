Feature: Add perimeters/group for action test 

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken



    * def perimeterQuestion =
"""
{
  "id" : "perimeterQuestion",
  "process" : "defaultProcess",
  "stateRights" : [
    {
      "state" : "responseState",
      "right" : "Write"
    },
        {
      "state" : "questionState",
      "right" : "ReceiveAndWrite"
    },
            {
      "state" : "multipleOptionsResponseState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "messageState",
      "right" : "ReceiveAndWrite"
    }
    {
      "state" : "processState",
      "right" : "ReceiveAndWrite"
    }
  ]
}
"""

  Scenario: Create perimeterQuestion
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterQuestion
    When method post
    Then status 201


  Scenario: Add perimeterQuestion for groups Dispatcher
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterQuestion"]
    When method patch
    Then status 200

  Scenario: Add perimeterQuestion for groups Planner
    Given url opfabUrl + 'users/groups/Planner/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterQuestion"]
    When method patch
    Then status 200
