Feature: CardsUserAcknowledgement


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/./getToken.feature') { username: 'operator2'}
    * def authToken2 = signIn2.authToken

    Scenario: CardsUserAcknowledgement

    * def card =
"""
{
	"publisher" : "api_test",
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

    

# Push card
    Given url opfabPublishCardUrl + 'cards'
    #And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201
    And match response.count == 1
    
#get card with user operator1 and check not containing userAcks items
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid


#make an acknoledgement to the card with operator1
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

#get card with user operator2 and check containing no ack for him
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid == uid


#make a second acknoledgement to the card with operator2
    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken2
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

#get card with user operator2 and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == true
    And match response.card.uid == uid



    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/unexisting_card_uid'
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 404



    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid == uid

    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 204


    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/unexisting_card____uid'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404
    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    When method delete
    Then status 200