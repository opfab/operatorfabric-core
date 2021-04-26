Feature: Cards


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken
    * def signInUserWithNoGroupNoEntity = callonce read('../common/getToken.feature') { username: 'userwithnogroupnoentity'}
    * def authTokenUserWithNoGroupNoEntity = signInUserWithNoGroupNoEntity.authToken

  Scenario: Post card

    * def card =
"""
{
	"publisher" : "api_test",
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

# Push card
    Given url opfabPublishCardUrl + 'cards'

    And request card
    When method post
    Then status 201
    And match response.count == 1



  Scenario: Post a new version of the card

    * def card =
"""
{
	"publisher" : "api_test",
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
    And request card
    When method post
    Then status 201
    And match response.count == 1

#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'new message'
    And def cardUid = response.uid
	And match response.card.publisherType == "EXTERNAL"

    #get card without  authentication
    Given url opfabUrl + 'cards/cards/api_test.process1'
    When method get
    Then status 401


  Scenario: Delete the card

#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardUid = response.uid

# delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    When method delete
    Then status 200

# delete card
    Given url opfabPublishCardUrl + 'cards/not_existing_card_id'
    When method delete
    Then status 404


  Scenario: Post two cards in one request

    * def card =
"""
[
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 1)"}
},
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
]
"""


  Scenario:  Post card with attribute externalRecipients

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test2","api_test165"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"test externalRecipients"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1

#get card with user operator1 and new attribute externalRecipients
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.externalRecipients[1] == "api_test165"
    And def cardUid = response.uid

Scenario:  Post card with no recipient but entityRecipients

    * def card =
"""
{
	"publisher" : "api_test",
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
    And request card
    When method post
    Then status 201
    And match response.count == 1

Scenario:  Post card with initialParentCardUid not correct

    * def card =
"""
{
	"publisher" : "api_test",
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
        And request card
        When method post
        Then status 201
        And match response.count == 0
        And match response.message contains "The initialParentCardUid 1 is not the uid of any card"

Scenario:  Post card with parentCardId not correct

    * def card =
"""
{
	"publisher" : "api_test",
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
    And request card
    When method post
    Then status 201
    And match response.count == 0
    And match response.message contains "The parentCardId 1 is not the id of any card"

Scenario:  Post card with correct parentCardId but initialParentCardUid not correct

    #get parent card id
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And def cardId = response.card.id

    * def card =
"""
{
	"publisher" : "api_test",
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
    And request card
    When method post
    Then status 201
    And match response.count == 0
    And match response.message contains "The initialParentCardUid 1 is not the uid of any card"

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
	"publisher" : "api_test",
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
    And request card
    When method post
    Then status 201
    And match response.count == 1
    And match response.message == "PushedCard was successfully handled"

Scenario: Push card and its two child cards, then get the parent card

    * def parentCard =
"""
{
	"publisher" : "api_test",
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
    And request parentCard
    When method post
    Then status 201
    And match response.count == 1

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
	"publisher" : "api_test",
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
	"publisher" : "api_test",
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
    And request childCard1
    When method post
    Then status 201
    And match response.count == 1

# Push the two child cards
    Given url opfabPublishCardUrl + 'cards'
    And request childCard2
    When method post
    Then status 201
    And match response.count == 1

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
	"publisher" : "api_test",
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
    And request cardForUserWithNoGroupNoEntity
    When method post
    Then status 201
    And match response.count == 1

#get card with user userwithnogroupnoentity
    Given url opfabUrl + 'cards/cards/api_test.processForUserWithNoGroupNoEntity'
    And header Authorization = 'Bearer ' + authTokenUserWithNoGroupNoEntity
    When method get
    Then status 200
    And match response.card.data.message == 'a message for user with no group and no entity'
    And def cardUid = response.card.uid

#get card from archives with user userwithnogroupnoentity
    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authTokenUserWithNoGroupNoEntity
    When method get
    Then status 200
    And match response.data.message == 'a message for user with no group and no entity'


Scenario: Push card with null keepChilCards and publisherType

    * def parentCard2 =
"""
{
	"publisher" : "api_test",
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
    And request parentCard2
    When method post
    Then status 201
    And match response.count == 1

#get parent card id
    Given url opfabUrl + 'cards/cards/api_test.processKeepChildCardsNull'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.keepChildCards == false
	And match response.card.publisherType == "EXTERNAL"
