Feature: Add perimeters/group for action test 

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken



    * def perimeterUserCardExamples3 =
"""
{
  "id" : "perimeterUserCardExamples3",
  "process" : "userCardExamples3",
  "stateRights" : [
    {
      "state" : "taskState",
      "right" : "ReceiveAndWrite"
    }
  ]
}
"""


  Scenario: Create perimeterUserCardExamples3
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUserCardExamples3
    When method post
    Then status 201


  Scenario: Add perimeterUserCardExamples3 for groups Dispatcher
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples3"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples3 for groups Planner
    Given url opfabUrl + 'users/groups/Planner/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples3"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples3 for groups Supervisor
    Given url opfabUrl + 'users/groups/Supervisor/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples3"]
    When method patch
    Then status 200

