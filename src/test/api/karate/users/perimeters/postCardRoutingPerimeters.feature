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
  "id" : "perimeterKarate16",
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

    * def groupDispatcherList =
"""
[
"Dispatcher"
]
"""

    #Card must be received
    * def cardForGroup =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardForGroup",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""


    #Card must be received, because the user has the right for this process/state and is in tne entity
    * def cardForEntityAndWithPerimeter =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardForEntityAndWithPerimeter",
	"state": "messageState",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""


    #Card must be received, because the user have the right for this process/state
    * def cardForEntityAndPerimeter =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"process1",
	"processInstanceId" : "cardForEntityAndPerimeter",
	"state": "state1",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""


     #Card must not be received, because the user is in entity and group but doesn't have receive right for this process/state
    * def cardForEntityAndGroupButNotRights =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardForEntityAndGroupButNotRights",
	"state": "defaultState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""


    #Card must not be received, because the user is in entity and have the right for process/state but is not in group Planner
    * def cardForEntityAndOtherGroupAndPerimeter =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"process1",
	"processInstanceId" : "cardForEntityAndOtherGroupAndPerimeter",
	"state": "state1",
	"groupRecipients": ["Planner"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""

    * def perimeter2 =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "Receive"
      }
    ]
}
"""
    * def perimeterArray =
"""
[   "perimeter"
]
"""

  Scenario: Create Perimeters
  #Create new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter2
    When method post
    Then status 201

  #Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterArray
    When method patch
    Then status 200

  #Create new perimeter (check if the perimeter already exists otherwise it will return 200)
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201
    And match response.id == perimeter.id
    And match response.process == perimeter.process
    And match response.stateRights == perimeter.stateRights


  Scenario: Put perimeter for Dispatcher group
    Given url opfabUrl + 'users/perimeters/'+ perimeter.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupDispatcherList
    When method put
    Then status 200


  Scenario: Push the card 'cardForGroup'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForGroup
    When method post
    Then status 201


  Scenario: Push the card 'cardForEntityAndWithPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForEntityAndWithPerimeter
    When method post
    Then status 201


  Scenario: Push the card 'cardForEntityAndPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForEntityAndPerimeter
    When method post
    Then status 201


  Scenario: Push the card 'cardForEntityAndGroupButNotRights'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForEntityAndGroupButNotRights
    When method post
    Then status 201


  Scenario: Push the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForEntityAndOtherGroupAndPerimeter
    When method post
    Then status 201


  Scenario: Get the card 'cardForGroup'
    Given url opfabUrl + 'cards/cards/api_test.cardForGroup'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.data.message == 'a message'


  Scenario: Get the card 'cardForEntityAndWithPerimeter'
    Given url opfabUrl + 'cards/cards/api_test.cardForEntityAndWithPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200


  Scenario: Get the card 'cardForEntityAndPerimeter'
    Given url opfabUrl + 'cards/cards/process1.cardForEntityAndPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.data.message == 'a message'


  Scenario: Get the card 'cardForEntityAndGroupButNotRights'
    Given url opfabUrl + 'cards/cards/api_test.cardForEntityAndGroupButNotRights'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404


  Scenario: Get the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabUrl + 'cards/cards/process1.cardForEntityAndOtherGroupAndPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404


  #delete perimeter created previously
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200
