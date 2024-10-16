Feature: CardsUserAcknowledgementUpdateCheck


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authToken2 = signIn2.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
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

    Scenario: CardsUserAcknowledgementUpdateCheck

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Maintainer"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

      * def entityArray =
"""
[   "ENTITY1_FR"
]
"""

#Create new perimeter
  * callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/Maintainer/perimeters'
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

    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

#make an acknowledgement to the card with operator1_fr
    Given url opfabUrl + 'cards-publication/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request entityArray
    When method post
    Then status 201

#get card with user operator1_fr and check containing his ack
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == true
    And match response.card.uid == uid


    * def cardUpdated =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Maintainer"],
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

  #get card with user operator1_fr and check containing any ack
  Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response.card.hasBeenAcknowledged == false
  And match response.card.uid != uid

  
Scenario: Delete the test card

  #delete card
  Given url opfabPublishCardUrl + 'cards/api_test.process1'
  And header Authorization = 'Bearer ' + authToken
  When method delete
  Then status 200

#delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}