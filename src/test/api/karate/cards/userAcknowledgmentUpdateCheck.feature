Feature: CardsUserAcknowledgementUpdateCheck


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/./getToken.feature') { username: 'tso2-operator'}
    * def authToken2 = signIn2.authToken

    Scenario: CardsUserAcknowledgementUpdateCheck

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TRANS"
			},
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

    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

#make an acknoledgement to the card with tso1
    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

#get card with user tso1-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == true
    And match response.card.uid == uid

    

    * def cardUpdated =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process1",
	"state": "messageState2",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TRANS"
			},
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message2"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    #And header Authorization = 'Bearer ' + authToken
    And request cardUpdated
    When method post
    Then status 201
    And match response.count == 1

    #get card with user tso1-operator and check containing any ack
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid != uid

    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test_process1'
    When method delete
    Then status 200
