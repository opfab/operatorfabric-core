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

    * def groupTSO1List =
"""
[
"TSO1"
]
"""

    #Card must be received
    * def cardForGroup =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "cardForGroup",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""


    #Card must not be received, because the user doesn't have the right for this process/state
    * def cardForEntityWithoutPerimeter =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "cardForEntityWithoutPerimeter",
	"state": "messageState",
	"recipient" : {
				"type" : "USER"
			},
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
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"process1",
	"processId" : "cardForEntityAndPerimeter",
	"state": "state1",
	"recipient" : {
				"type" : "USER"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""


     #Card must be received, because the user is in entity and group
    * def cardForEntityAndGroup =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "cardForEntityAndGroup",
	"state": "defaultState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
}
"""


    #Card must be received, because the user is in entity and have the right for process/state
    * def cardForEntityAndOtherGroupAndPerimeter =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
	"process"  :"process1",
	"processId" : "cardForEntityAndOtherGroupAndPerimeter",
	"state": "state1",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO2"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1"]
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


  Scenario: Put perimeter for TSO1 group
    Given url opfabUrl + 'users/perimeters/'+ perimeter.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupTSO1List
    When method put
    Then status 200


  Scenario: Push the card 'cardForGroup'
    Given url opfabPublishCardUrl + 'cards'
    And request cardForGroup
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Push the card 'cardForEntityWithoutPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And request cardForEntityWithoutPerimeter
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Push the card 'cardForEntityAndPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And request cardForEntityAndPerimeter
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Push the card 'cardForEntityAndGroup'
    Given url opfabPublishCardUrl + 'cards'
    And request cardForEntityAndGroup
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Push the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And request cardForEntityAndOtherGroupAndPerimeter
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Get the card 'cardForGroup'
    Given url opfabUrl + 'cards/cards/api_test_cardForGroup'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.data.message == 'a message'


  Scenario: Get the card 'cardForEntityWithoutPerimeter'
    Given url opfabUrl + 'cards/cards/api_test_cardForEntityWithoutPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404


  Scenario: Get the card 'cardForEntityAndPerimeter'
    Given url opfabUrl + 'cards/cards/api_test_cardForEntityAndPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.data.message == 'a message'


  Scenario: Get the card 'cardForEntityAndGroup'
    Given url opfabUrl + 'cards/cards/api_test_cardForEntityAndGroup'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.data.message == 'a message'


  Scenario: Get the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabUrl + 'cards/cards/api_test_cardForEntityAndOtherGroupAndPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.data.message == 'a message'