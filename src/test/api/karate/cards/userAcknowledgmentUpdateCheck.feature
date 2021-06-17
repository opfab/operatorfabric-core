Feature: CardsUserAcknowledgementUpdateCheck


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/getToken.feature') { username: 'operator2'}
    * def authToken2 = signIn2.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

    Scenario: CardsUserAcknowledgementUpdateCheck

    * def card =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["ReadOnly"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
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
        "right" : "Receive"
      },
      {
        "state" : "messageState2",
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

#Create new perimeter
      Given url opfabUrl + 'users/perimeters'
      And header Authorization = 'Bearer ' + authTokenAdmin
      And request perimeter
      When method post
      Then status 201

#Attach perimeter to group
      Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
      And header Authorization = 'Bearer ' + authTokenAdmin
      And request perimeterArray
      When method patch
      Then status 200

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

#make an acknowledgement to the card with operator1
    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

#get card with user operator1 and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == true
    And match response.card.uid == uid

#get card with user operator1 and check containing his ack
      Given url opfabPublishCardUrl + 'cards/traces/ack/' + uid
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then status 200
      And match response.userName == "operator1"
      And match response.action == "Acknowledgment"


    * def cardUpdated =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState2",
	"groupRecipients": ["ReadOnly"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message2"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request cardUpdated
    When method post
    Then status 201

    #get card with user operator1 and check containing any ack
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid != uid

    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter created previously
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200
