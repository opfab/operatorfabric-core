Feature: CardsUserAcknowledgement


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/./getToken.feature') { username: 'tso2-operator'}
    * def authToken2 = signIn2.authToken

    Scenario: Post card

    * def card =
"""
{
	"publisher" : "api_test",
	"publisherVersion" : "1",
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

#get card with user tso1-operator and check not containing userAcks items
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.hasBeenAcknowledged == false

    Scenario: Call to the endpoint of CardsUserAcknowledgement using tso1

#make an acknoledgement to the card with tso1
    Given url opfabPublishCardUrl + 'cards/api_test_process1/userAcknowledgement'
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201
    And match response.count == 1

#get card with user tso1-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.hasBeenAcknowledged == true

#get card with user tso2-operator and check containing no ack for him
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.hasBeenAcknowledged == false

    Scenario: Call to the endpoint of CardsUserAcknowledgement using tso2

#make a second acknoledgement to the card with tso2
    Given url opfabPublishCardUrl + 'cards/api_test_process1/userAcknowledgement'
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 201
    And match response.count == 1

#get card with user tso1-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.hasBeenAcknowledged == true

#get card with user tso2-operator and check containing his ack
    Given url opfabUrl + 'cards/cards/api_test_process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.hasBeenAcknowledged == true

    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test_process1'
    When method delete
    Then status 200
