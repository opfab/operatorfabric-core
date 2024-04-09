Feature: LastUpdate


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

Scenario: Configuration

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
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

Scenario: Create a card, update it, read it and acknowledge it

    * def card =
"""
{
	"publisher" : "operator1_fr",
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

    * def updateCard =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["ReadOnly"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"updated message"},
}
"""

    * def entity1Array =
"""
[   "ENTITY1_FR"
]
"""

    # Push card
        Given url opfabPublishCardUrl + 'cards'
        And header Authorization = 'Bearer ' + authToken
        And request card
        When method post
        Then status 201
        And def uid = response.uid
        And def creationDate = response.lastUpdate

    # Check lastUpdate field is correct
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        And def now = new Date ().valueOf()
        And def tenSecondsAgo = new Date(now - 10000).valueOf()
        When method get
        Then status 200
        And assert response.card.lastUpdate >= tenSecondsAgo && response.card.lastUpdate <= now
        And match response.card.uid == uid

    # Push update card
        Given url opfabPublishCardUrl + 'cards'
        And header Authorization = 'Bearer ' + authToken
        And request updateCard
        When method post
        Then status 201
        And def uid = response.uid
        And def updateDate = response.lastUpdate

    # Check lastUpdate field has been updated
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And assert response.card.lastUpdate > creationDate
        And match response.card.uid == uid

    # Make an acknowledgement to the card with operator1_fr
        Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
        And header Authorization = 'Bearer ' + authToken
        And request entity1Array
        When method post
        Then status 201
        And def acknowledgementDate = new Date ().valueOf()

    # Check lastUpdate field has been updated
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And assert response.card.lastUpdate > updateDate
        And match response.card.uid == uid

    # Unacknowledge the card
        Given url opfabUrl + 'cardspub/cards/cancelUserAcknowledgement/' + uid
        And header Authorization = 'Bearer ' + authToken
        And request entity1Array
        When method post
        Then status 200
        And def unacknowledgementDate = new Date ().valueOf()
    
    # Check lastUpdate field has been updated
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And assert response.card.lastUpdate > acknowledgementDate
        And match response.card.uid == uid
    
    # Signal that card has been read card by operator1_fr
        Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
        And header Authorization = 'Bearer ' + authToken
        And request ''
        When method post
        Then status 201
        And def readDate = new Date ().valueOf()

    # Check lastUpdate field is correct
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And assert response.card.lastUpdate > unacknowledgementDate
        And match response.card.uid == uid
    
    # Unread the card
        Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
        And header Authorization = 'Bearer ' + authToken
        And request entity1Array
        When method delete
        Then status 200

    # Check lastUpdate field is correct
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And assert response.card.lastUpdate > readDate
        And match response.card.uid == uid


Scenario: Delete the test card and config

    # Delete card
        Given url opfabPublishCardUrl + 'cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method delete
        Then status 200

    # Delete perimeter created previously
        Given url opfabUrl + 'users/perimeters/perimeter'
        And header Authorization = 'Bearer ' + authTokenAdmin
        When method delete
        Then status 200