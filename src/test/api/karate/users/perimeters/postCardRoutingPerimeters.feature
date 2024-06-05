Feature: CreatePerimeters (endpoint tested : POST /perimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

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
	"publisher" : "operator1_fr",
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


    #Card must be received, because the user has the right for this process/state and is in the entity
    * def cardForEntityAndWithPerimeter =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardForEntityAndWithPerimeter",
	"state": "messageState",
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1_FR"]
}
"""


    #Card must not be received, because the user is in entity and has the right for process/state but is not in group Planner
    * def cardForEntityAndOtherGroupAndPerimeter =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardForEntityAndOtherGroupAndPerimeter",
	"state": "messageState",
	"groupRecipients": ["Planner"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"entityRecipients" : ["ENTITY1_FR"]
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
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

  * def perimeterWrite =
  """
  {
    "id" : "perimeterWrite",
    "process" : "api_test",
    "stateRights" : [
        {
          "state" : "incidentInProgressState",
          "right" : "ReceiveAndWrite"
        }
      ]
  }
  """
  
    * def perimeterArray =
"""
[   "perimeter",
    "perimeterWrite"
]
"""


  Scenario: Create Perimeters
  #Create new perimeter
    * callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeter2)', token: '#(authToken)'}

  #Create new perimeter
    * callonce read('../../common/createPerimeter.feature') {perimeter: '#(perimeterWrite)', token: '#(authToken)'}

  #Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterArray
    When method patch
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



  Scenario: Push the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardForEntityAndOtherGroupAndPerimeter
    When method post
    Then status 201


  Scenario: Get the card 'cardForGroup'
    Given url opfabUrl + 'cards-consultation/cards/api_test.cardForGroup'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.card.data.message == 'a message'


  Scenario: Get the card 'cardForEntityAndWithPerimeter'
    Given url opfabUrl + 'cards-consultation/cards/api_test.cardForEntityAndWithPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200



  Scenario: Get the card 'cardForEntityAndOtherGroupAndPerimeter'
    Given url opfabUrl + 'cards-consultation/cards/api_test.cardForEntityAndOtherGroupAndPerimeter'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404


  #delete perimeter created previously
    * callonce read('../../common/deletePerimeter.feature') {perimeterId: '#(perimeter2.id)', token: '#(authToken)'}

  #delete perimeter created previously
    * callonce read('../../common/deletePerimeter.feature') {perimeterId: '#(perimeterWrite.id)', token: '#(authToken)'}