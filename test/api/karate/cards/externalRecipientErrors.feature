Feature: External recipient application errors

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
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



  Scenario: Create groupKarate
    Given def result = callonce read('../common/createGroup.feature') {group: '#(groupKarate)', token: '#(authToken)'}
    Then match result.response.description == groupKarate.description
    And match result.response.name == groupKarate.name
    And match result.response.id == groupKarate.id


  Scenario: Add operator1_fr to groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Create perimeter_1
    * callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter_1)', token: '#(authToken)'}


  Scenario: Put groupKarate for perimeter_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupArray
    When method put
    Then status 200



  Scenario: Push user card with not existent external recipient
    * def card =
"""
{
	"publisher" : "ENTITY1_FR",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_5",
	"state": "state2",
	"externalRecipients" : ["wrong_externalRecipient1"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}

"""

# Push card
    Given url opfabPublishCardUrl + '/cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.message  ==  'Url specified for external application is invalid'


  Scenario: Push user card with external recipient URL not found
    * def card =
"""
{
	"publisher" : "ENTITY1_FR",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_5",
	"state": "state2",
	"externalRecipients" : ["notFoundExternalRecipient"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}

"""

# Push card
    Given url opfabPublishCardUrl + '/cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 500
    And match response.message  ==  'External application endpoint not found (HTTP 404)'



  Scenario: Push user card with external recipient URL invalid
    * def card =
"""
{
	"publisher" : "ENTITY1_FR",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_5",
	"state": "state2",
	"externalRecipients" : ["invalidUrlExternalRecipient"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}

"""

# Push card
    Given url opfabPublishCardUrl + '/cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.message  ==  'Url specified for external application is invalid'


  Scenario: Push user card with external recipient application not responding
    * def card =
"""
{
	"publisher" : "ENTITY1_FR",
	"processVersion" : "1",
	"process"  :"process_1",
	"processInstanceId" : "process_id_5",
	"state": "state2",
	"externalRecipients" : ["connectionRefusedExternalRecipient"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}

"""

# Push card
    Given url opfabPublishCardUrl + '/cards/userCard'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 502
    And match response.message  ==  'I/O exception accessing external application endpoint'





# delete user from group
  Scenario: Delete user operator1_fr from groupKarate
    Given url opfabUrl + 'users/groups/' + groupKarate.id  + '/users/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter_1.id)', token: '#(authToken)'}

