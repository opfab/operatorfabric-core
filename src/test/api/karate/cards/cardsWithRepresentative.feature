Feature: Cards with representative

  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken

  Scenario: Post a card with representative

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processRepresentative",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message with fields representative and representativeType"},
	"representative" : "ENTITY1",
	"representativeType" : "ENTITY"
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201


  Scenario: Get the card, get the card from archives then delete the card

#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.processRepresentative'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message with fields representative and representativeType'
    And match response.card.representative == 'ENTITY1'
    And match response.card.representativeType == 'ENTITY'
    And def cardUid = response.card.uid

#get card form archives with user operator1

    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'a message with fields representative and representativeType'
    And match response.representative == 'ENTITY1'
    And match response.representativeType == 'ENTITY'


 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processRepresentative'
    When method delete
    Then status 200

