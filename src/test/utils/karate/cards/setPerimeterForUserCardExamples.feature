Feature: Add perimeters/group for action test 

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken



    * def perimeterUserCardExamples =
"""
{
  "id" : "perimeterUserCardExamples",
  "process" : "userCardExamples",
  "stateRights" : [
    {
      "state" : "messageState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "conferenceState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "questionState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "taskState",
      "right" : "ReceiveAndWrite"
    },
    {
      "state" : "incidentInProgressState",
      "right" : "ReceiveAndWrite"
    }
  ]
}
"""


  Scenario: Create perimeterUserCardExamples
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterUserCardExamples
    When method post
    Then status 201


  Scenario: Add perimeterUserCardExamples for groups Dispatcher
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples for groups Planner
    Given url opfabUrl + 'users/groups/Planner/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples"]
    When method patch
    Then status 200

  Scenario: Add perimeterUserCardExamples for groups Supervisor
    Given url opfabUrl + 'users/groups/Supervisor/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request ["perimeterUserCardExamples"]
    When method patch
    Then status 200

