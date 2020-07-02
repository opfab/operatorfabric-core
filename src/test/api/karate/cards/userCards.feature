Feature: UserCards tests

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

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
        "right" : "Write"
      },
      {
        "state" : "state2",
        "right" : "Receive"
      }
  ]
}
"""

    * def tso1operatorArray =
"""
[   "tso1-operator"
]
"""
    * def groupArray =
"""
[   "groupKarate"
]
"""

  Scenario: Create groupKarate
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate
    When method post
    Then match response.description == groupKarate.description
    And match response.name == groupKarate.name
    And match response.id == groupKarate.id


  Scenario: Add tso1-operator to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request tso1operatorArray
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
	"publisher" : "api_test_externalRecipient1",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_1",
	"state": "state2",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    # Push user card without authentication
    Given url opfabPublishCardUrl + 'cards/userCard'
    And request card
    When method post
    Then status 401


# Push user card with good permiter ==> ReceiveAndWrite perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count == 1

    * def card =
"""
{
	"publisher" : "api_test_externalRecipient1",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_1",
	"state": "state1",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
# Push user card with not authorized permiter ==> Receive perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count != 1



    * def card =
"""
{
	"publisher" : "api_test_externalRecipient1",
	"processVersion" : "1",
	"process"  :"process_2",
	"processInstanceId" : "process_2",
	"state": "state1",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"externalRecipients" : ["api_test_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push user card with good permiter ==> Write perimeter
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.count == 1



# delete user from group
  Scenario: Delete user tso1-operator from groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id  + '/users/tso1-operator'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200





