Feature: Post cards with entitiesAllowedToEdit 

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def signInAsTSO2 = callonce read('../common/getToken.feature') { username: 'operator2'}
    * def authTokenAsTSO2 = signInAsTSO2.authToken

  Scenario: Push cards with entitiesAllowedToEdit

    * def card1 =
"""
{
	"publisher" : "ENTITY1",
	"publisherType": "ENTITY",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process_withEntitiesToEdit",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"entitiesAllowedToEdit": ["ENTITY1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

  * def card2 =
  """
  {
    "publisher" : "ENTITY2",
    "publisherType": "ENTITY",
    "processVersion" : "1",
    "process"  :"api_test",
    "processInstanceId" : "process_withEntitiesToEdit",
    "state": "messageState",
    "groupRecipients": ["Dispatcher"],
    "entitiesAllowedToEdit": ["ENTITY1","ENTITY2"],
    "severity" : "INFORMATION",
    "startDate" : 1553186770681,
    "summary" : {"key" : "defaultProcess.summary"},
    "title" : {"key" : "defaultProcess.title"},
    "data" : {"message":"new message"}
  }
  """

    * def card3 =
    """
    {
      "publisher" : "ENTITY1",
      "publisherType": "ENTITY",
      "processVersion" : "1",
      "process"  :"api_test",
      "processInstanceId" : "process_withEntitiesToEdit",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "entitiesAllowedToEdit": ["ENTITY1","ENTITY2"],
      "severity" : "INFORMATION",
      "startDate" : 1553186770681,
      "summary" : {"key" : "defaultProcess.summary"},
      "title" : {"key" : "defaultProcess.title"},
      "data" : {"message":"new message"}
    }
    """


    * def perimeter =
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

    * def perimeterArray =
"""
[   "perimeter"
]
"""


#Create new perimeter
   Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeter
    When method post
    Then status 201

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/Planner/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

# Push card with entitiesAllowedToRespond set
    Given url opfabPublishCardUrl + 'cards/userCard'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card1
    When method post
    Then status 201


# Get card with user operator1 and check entitiesAllowedToEdit field
Given url opfabUrl + 'cards/cards/api_test.process_withEntitiesToEdit'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method get
Then status 200
And assert response.card.entitiesAllowedToEdit.length  == 1
And match response.card.entitiesAllowedToEdit[0]  == 'ENTITY1'


# Edit card with operator2 is forbidden
Given url opfabPublishCardUrl + 'cards/userCard'
And header Authorization = 'Bearer ' + authTokenAsTSO2
And request card2
When method post
Then status 403


# Updte card with operator1 to allow ENTITY2 to edit the card
Given url opfabPublishCardUrl + 'cards/userCard'
And header Authorization = 'Bearer ' + authTokenAsTSO
And request card3
When method post
Then status 201

# Edit card with operator2 is allowed
Given url opfabPublishCardUrl + 'cards/userCard'
And header Authorization = 'Bearer ' + authTokenAsTSO2
And request card2
When method post
Then status 201

# Get card with user operator1 and check publisher field
Given url opfabUrl + 'cards/cards/api_test.process_withEntitiesToEdit'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method get
Then status 200
And match response.card.publisher  == 'ENTITY2'


Scenario: Clean

#delete perimeter created previously
Given url opfabUrl + 'users/perimeters/perimeter'
And header Authorization = 'Bearer ' + authTokenAdmin
When method delete
Then status 200