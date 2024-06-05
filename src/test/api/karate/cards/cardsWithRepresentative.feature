Feature: Cards with representative

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
	"representative" : "ENTITY1_FR",
	"representativeType" : "ENTITY"
}
"""

#Create new perimeter
* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

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


  Scenario: Get the card, get the card from archives then delete the card

#get card with user operator1_fr
    Given url opfabUrl + 'cards-consultation/cards/api_test.processRepresentative'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message with fields representative and representativeType'
    And match response.card.representative == 'ENTITY1_FR'
    And match response.card.representativeType == 'ENTITY'
    And def cardUid = response.card.uid

#get card form archives with user operator1_fr

    Given url opfabUrl + 'cards-consultation/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message with fields representative and representativeType'
    And match response.card.representative == 'ENTITY1_FR'
    And match response.card.representativeType == 'ENTITY'


 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processRepresentative'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  #delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
