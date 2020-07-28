Feature: CardsUserRead


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/./getToken.feature') { username: 'tso2-operator'}
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
    
#get card with user tso1-operator and check it hasn't been read yet
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And def uid = response.card.uid


#Signal that card has been read card by tso1-operator
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

#get card with user tso1-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.uid == uid

#get card with user tso2-operator and check containing no ack for him
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.uid == uid


#make a second acknoledgement to the card with tso2
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 201

#get card with user tso1-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.uid == uid

    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    When method delete
    Then status 200
