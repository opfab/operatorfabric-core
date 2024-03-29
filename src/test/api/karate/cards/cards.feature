Feature: Cards


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInForOperator5 = callonce read('../common/getToken.feature') { username: 'operator5_fr'}
    * def authTokenForOperator5 = signInForOperator5.authToken
    * def signInUserWithNoGroupNoEntity = callonce read('../common/getToken.feature') { username: 'userwithnogroupnoentity'}
    * def authTokenUserWithNoGroupNoEntity = signInUserWithNoGroupNoEntity.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
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

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201
    And match response == {"id":'#notnull', uid: '#notnull'}



  Scenario: Post a new version of the card

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201
    And def cardUid = response.uid
    And def cardId = response.id

#get card with user operator1_fr
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'new message'
	And match response.card.publisherType == "EXTERNAL"
    And match response.card.id == cardId
    And match response.card.uid == cardUid
    And match response.card.titleTranslated == 'card Title'
    And match response.card.summaryTranslated == 'card summary'
    And match response.card.severity == 'INFORMATION'


    #get card without  authentication
    Given url opfabUrl + 'cards/cards/api_test.process1'
    When method get
    Then status 401


  Scenario: Delete the card

#get card with user operator1_fr
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardUid = response.card.uid

# delete card without authentication
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    When method delete
    Then status 401

# delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

# delete card
    Given url opfabPublishCardUrl + 'cards/not_existing_card_id'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404



  Scenario:  Post card with attribute externalRecipients

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test_externalRecipient1","api_test165"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

# Get card with user operator1_fr and new attribute externalRecipients
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.externalRecipients[1] == "api_test165"
    And def cardUid = response.card.uid

# Delete the card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

# Make sure externalRecipients are notified of card suppression
* configure retry = { count: 3, interval: 3000 }
    Given url opfabUrl + 'cards/cards/api_test.process1_deleted'
    And header Authorization = 'Bearer ' + authTokenForOperator5
    And retry until responseStatus == 200 
    When method get
    Then match response.card.data.message == "Card with id=api_test.process1 received by externalApp. Card sent for karate tests, addressed to : operator5_fr   "


# Delete the confirmation card to clean the test environnement
    Given url opfabPublishCardUrl + 'cards/api_test.process1_deleted'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


Scenario:  Post card with no recipient but entityRecipients

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2",
	"state": "messageState",
	"entityRecipients" : ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

Scenario:  Post card with initialParentCardUid not correct

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"},
	"initialParentCardUid": "1"
}
"""

# Push card
        Given url opfabPublishCardUrl + 'cards'
		And header Authorization = 'Bearer ' + authToken
        And request card
        When method post
        Then status 400
        And match response.message contains "Constraint violation in the request"
        And match response.errors[0] contains "The initialParentCardUid 1 is not the uid of any card"

Scenario:  Post card with parentCardId not correct

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"},
	"parentCardId": "1"
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 400
    And match response.message contains "Constraint violation in the request"
    And match response.errors[0] contains "The parentCardId 1 is not the id of any card"

Scenario:  Post card with correct parentCardId but initialParentCardUid not correct


    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

    # Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

    #get parent card id
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardId = response.card.id

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"},
	"initialParentCardUid" : "1"
}
"""
    * card.parentCardId = cardId

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 400
    And match response.message contains "Constraint violation in the request"
    And match response.errors[0] contains "The initialParentCardUid 1 is not the uid of any card"

Scenario:  Post card with correct parentCardId and initialParentCardUid

    #get parent card id
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardId = response.card.id
    And def cardUid = response.card.uid

	* def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* card.parentCardId = cardId
    * card.initialParentCardUid = cardUid

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

Scenario: Push card and its two child cards, then get the parent card

    * def parentCard =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push parent card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request parentCard
    When method post
    Then status 201

#get parent card id
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def parentCardId = response.card.id
    And def parentCardUid = response.card.uid

# Push two child cards
    * def childCard1 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" :"1",
	"process"  :"api_test",
	"processInstanceId" : "processChild1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* childCard1.parentCardId = parentCardId
    * childCard1.initialParentCardUid = parentCardUid

	* def childCard2 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processChild2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""
	* childCard2.parentCardId = parentCardId
    * childCard2.initialParentCardUid = parentCardUid

# Push the two child cards
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request childCard1
    When method post
    Then status 201

# Push the two child cards
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request childCard2
    When method post
    Then status 201

# Get the parent card with its two child cards

    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And assert response.childCards.length == 2


Scenario: Push a card for a user with no group and no entity

    * def cardForUserWithNoGroupNoEntity =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processForUserWithNoGroupNoEntity",
	"state": "messageState",
	"userRecipients": ["userwithnogroupnoentity"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message for user with no group and no entity"}
}
"""

# Push card for user with no group and no entity
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request cardForUserWithNoGroupNoEntity
    When method post
    Then status 201

#get card with user userwithnogroupnoentity
    Given url opfabUrl + 'cards/cards/api_test.processForUserWithNoGroupNoEntity'
    And header Authorization = 'Bearer ' + authTokenUserWithNoGroupNoEntity
    When method get
    Then status 404


Scenario: Push card with null keepChilCards and publisherType

    * def parentCard2 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processKeepChildCardsNull",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
    "keepChildCards": null,
	"publisherType": null,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push parent card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request parentCard2
    When method post
    Then status 201

#get parent card id
    Given url opfabUrl + 'cards/cards/api_test.processKeepChildCardsNull'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.keepChildCards == false
	And match response.card.publisherType == "EXTERNAL"



    
#delete perimeter created previously
  Given url opfabUrl + 'users/perimeters/perimeter'
  And header Authorization = 'Bearer ' + authTokenAdmin
  When method delete
  Then status 200