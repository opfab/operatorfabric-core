Feature: Add perimeters/group for action test 

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken



    * def perimeterUserCardExamples2 =
"""
{
  "id" : "perimeterUserCardExamples2",
  "process" : "userCardExamples2",
  "stateRights" : [
    {
      "state" : "messageState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "questionState",
      "right" : "ReceiveAndWrite"
    }
  ]
}
"""


  Scenario: Create perimeterUserCardExamples2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUserCardExamples2
    When method post
    Then status 201


  Scenario: Add perimeterUserCardExamples2 for groups Dispatcher
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples2"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples2 for groups Planner
    Given url opfabUrl + 'users/groups/Planner/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples2"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples2 for groups Supervisor
    Given url opfabUrl + 'users/groups/Supervisor/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples2"]
    When method patch
    Then status 200

