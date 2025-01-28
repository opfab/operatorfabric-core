Feature: CardsReminder


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authToken2 = signIn2.authToken
    * def signInInternal = callonce read('../common/getToken.feature') { username: 'opfab'}
    * def authTokenInternal = signInInternal.authToken
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


Scenario: Send card and receive reminder

#Create new perimeter
* call read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/Maintainer/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200


Scenario: ResetCardsReadsAndAcks

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
    "groupRecipients": ["Maintainer"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    * def cardWithNotNotifiedAction =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardWithNotNotifiedAction",
	"state": "messageState",
    "groupRecipients": ["Maintainer"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"actions" : ["NOT_NOTIFIED"]
}
"""


# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

    #Signal that card has been read card by operator1_fr
    Given url opfabUrl + 'cards-publication/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

    #make an acknowledgement to the card with operator1_fr
    Given url opfabUrl + 'cards-publication/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request entity1Array
    When method post
    Then status 201


    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And def uid = response.card.uid

    #Signal that card has been read card by operator2_fr
    Given url opfabUrl + 'cards-publication/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 201

    #make an acknowledgement to the card with operator2_fr
    Given url opfabUrl + 'cards-publication/cards/userAcknowledgement/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request entity2Array
    When method post
    Then status 201

#get card with user operator1_fr and check hasBeenRead is set to true
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.hasBeenAcknowledged == true
    And match response.card.entitiesAcks == ["ENTITY1_FR", "ENTITY2_FR"]
    And match response.card.uid == uid

    #call resetReadAndAcks with unauthorized user operator2_fr 
    Given url opfabUrl + 'cards-publication/cards/resetReadAndAcks/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 403

    #call resetReadAndAcks with not existent card Uid 
    Given url opfabUrl + 'cards-publication/cards/resetReadAndAcks/' + 'notExistingUid'
    And header Authorization = 'Bearer ' + authTokenInternal
    And request ''
    When method post
    Then status 404

    Given url opfabUrl + 'cards-publication/cards/resetReadAndAcks/' + uid
    And header Authorization = 'Bearer ' + authTokenInternal
    And request ''
    When method post
    Then status 200

    #get card with user operator1_fr and check hasBeenRead and hasBeenAcknowledged is set to false and entitiesAck is empty
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.entitiesAcks == '#notpresent'
    And match response.card.uid == uid
    
    #get card with user operator2_fr and check hasBeenRead and hasBeenAcknowledged is set to false
    Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.uid == uid

    #Send a card with action NOT_NOTIFIED and call resetReadAndAcks endpoint
    # Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request cardWithNotNotifiedAction
    When method post
    Then status 201

    Given url opfabUrl + 'cards-consultation/cards/api_test.cardWithNotNotifiedAction'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.actions == ["NOT_NOTIFIED"]
    And def uid = response.card.uid

    Given url opfabUrl + 'cards-publication/cards/resetReadAndAcks/' + uid
    And header Authorization = 'Bearer ' + authTokenInternal
    And request ''
    When method post
    Then status 200

    #get card and check actions does not contain 'NOT_NOTIFIED' and hasBeenRead/hasBeenAcknowledged is set to false and entitiesAck is empty
    Given url opfabUrl + 'cards-consultation/cards/api_test.cardWithNotNotifiedAction'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.hasBeenAcknowledged == false
    And match response.card.entitiesAcks == '#notpresent'
    And match response.card.actions == '#notpresent'
    And match response.card.uid == uid

  Scenario: Delete the test card

#    delete card
#    Given url opfabPublishCardUrl + 'cards/api_test.process1'
#    And header Authorization = 'Bearer ' + authToken
#    When method delete
#    Then status 200

  #delete perimeter created previously
    * call read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}