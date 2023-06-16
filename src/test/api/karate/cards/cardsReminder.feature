Feature: CardsReminder


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authToken2 = signIn2.authToken
    * def signInInternal = callonce read('../common/getToken.feature') { username: 'opfab_internal_account'}
    * def authTokenInternal = signInInternal.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def signInAsREADONLY = callonce read('../common/getToken.feature') { username: 'operator1_crisisroom'}
    * def authTokenAsREADONLY = signInAsREADONLY.authToken

    Scenario: ResetCardsReadsAndAcks

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

      * def entity1Array =
"""
[   "ENTITY1_FR"
]
"""

      * def entity2Array =
"""
[   "ENTITY2_FR"
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

    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

    #Signal that card has been read card by operator1_fr
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

    #make an acknowledgement to the card with operator1_fr
    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request entity1Array
    When method post
    Then status 201


    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

    #Signal that card has been read card by operator2_fr
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 201

    #make an acknowledgement to the card with operator2_fr
    Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request entity2Array
    When method post
    Then status 201

#get card with user operator1_fr and check hasBeenRead is set to true
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.hasBeenAcknowledged == true
    And match response.card.uid == uid

    #call resetReadAndAcks with unauthorized user operator2_fr 
    Given url opfabUrl + 'cardspub/cards/resetReadAndAcks/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 403

    #call resetReadAndAcks with not existent card Uid 
    Given url opfabUrl + 'cardspub/cards/resetReadAndAcks/' + 'notExistingUid'
    And header Authorization = 'Bearer ' + authTokenInternal
    And request ''
    When method post
    Then status 404

    Given url opfabUrl + 'cardspub/cards/resetReadAndAcks/' + uid
    And header Authorization = 'Bearer ' + authTokenInternal
    And request ''
    When method post
    Then status 200

    #get card with user operator1_fr and check hasBeenRead and hasBeenAcknowledged is set to false
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid == uid
    
    #get card with user operator2_fr and check hasBeenRead and hasBeenAcknowledged is set to false
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid == uid

  Scenario: Delete the test card

#    delete card
#    Given url opfabPublishCardUrl + 'cards/api_test.process1'
#    And header Authorization = 'Bearer ' + authToken
#    When method delete
#    Then status 200

  #delete perimeter created previously
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200