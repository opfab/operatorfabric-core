Feature: KeepCardsUserReadsAndAcks


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
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

    Scenario: CardsUserRead

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

    * def updateCard =
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
	"data" : {"message":"updated message"},
  "actions": ["KEEP_EXISTING_ACKS_AND_READS","KEEP_EXISTING_PUBLISH_DATE"]
}
"""

    * def entity1Array =
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
    And def uid = response.uid

#Signal that card has been read card by operator1_fr
    Given url opfabUrl + 'cards-publication/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

#make an acknowledgement to the card with operator1_fr
    Given url opfabUrl + 'cards-publication/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request entity1Array
    When method post
    Then status 201

#get card with user operator1_fr and check containing his ack
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == true
    And match response.card.entitiesAcks ==  ["ENTITY1_FR"]
    And match response.card.uid == uid

# Push update card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request updateCard
    When method post
    Then status 201
    And def uid = response.uid

#get card with user operator1_fr and check hasBeenRead, hasBeenAcknowledged and entitiesAcks were kept
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.hasBeenAcknowledged == true
    And match response.card.entitiesAcks ==  ["ENTITY1_FR"]
    And match response.card.uid == uid

    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
