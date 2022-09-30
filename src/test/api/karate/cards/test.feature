Feature: UserCards tests

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsItsupervisor1 = callonce read('../common/getToken.feature') { username: 'itsupervisor1'}
    * def authTokenAsItsupervisor1 = signInAsItsupervisor1.authToken

    * def groupKarate =
"""
{
  "id" : "groupKarate",
  "name" : "groupKarate name",
  "description" : "groupKarate description"
}
"""


    * def perimeter_1 =
"""
{
  "id" : "perimeterKarate_1",
  "process" : "process_1",
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

    * def perimeter_2 =
"""
{
  "id" : "perimeterKarate_2",
  "process" : "process_2",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "ReceiveAndWrite"
      },
      {
        "state" : "state2",
        "right" : "Receive"
      }
  ]
}
"""

    * def operator1Array =
"""
[   "operator1_fr"
]
"""
    * def groupArray =
"""
[   "groupKarate"
]
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
      },
      {
        "state" : "incidentInProgressState",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

    * def perimeterForDefaultProcess =
"""
{
  "id" : "perimeterForDefaultProcess",
  "process" : "defaultProcess",
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

    * def perimeterForSupervisorGroup =
"""
[   "perimeterForDefaultProcess"
]
"""

  Scenario: Create perimeter for initial process
#Create new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterArray
    When method patch
    Then status 200

#Create new perimeter perimeterForDefaultProcess
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterForDefaultProcess
    When method post
    Then status 201

#Attach perimeterForDefaultProcess to group Supervisor
    Given url opfabUrl + 'users/groups/Supervisor/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterForSupervisorGroup
    When method patch
    Then status 200

  Scenario: Create groupKarate
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate
    When method post
    Then match response.description == groupKarate.description
    And match response.name == groupKarate.name
    And match response.id == groupKarate.id


  Scenario: Add operator1_fr to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Create perimeter_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter_1
    When method post



  Scenario: Create perimeter_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter_2
    When method post



  Scenario: Put groupKarate for perimeter_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200


  Scenario: Put groupKarate for perimeter_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200
  


    * def card =
"""
{
	"publisher" : "ENTITY1_FR",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_w",
	"state": "state2",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
  

    # Push user card with good perimeter ==> ReceiveAndWrite perimeter
Given url opfabPublishCardUrl + 'cards/userCard'
And header Authorization = 'Bearer ' + authTokenAsTSO
And request card
When method post
Then status 201


#get card with user operator1_fr
Given url opfabUrl + 'cards/cards/process_1.process_id_w'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method get
Then status 200
And match response.card.publisherType == "ENTITY"


# delete user from group
  Scenario: Delete user operator1_fr from groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id  + '/users/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter created previously
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeterForDefaultProcess created previously
    Given url opfabUrl + 'users/perimeters/perimeterForDefaultProcess'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter_1 created previously
    Given url opfabUrl + 'users/perimeters/' + perimeter_1.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter_2 created previously
    Given url opfabUrl + 'users/perimeters/' + perimeter_2.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

# delete groupKarate
  Scenario: Delete groupKarate created previously
    Given url opfabUrl + 'users/groups/' + groupKarate.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


