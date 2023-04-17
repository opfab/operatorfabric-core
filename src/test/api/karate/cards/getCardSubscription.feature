Feature: get card Subscription

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsTSO4 = callonce read('../common/getToken.feature') { username: 'operator4_fr'}
    * def authTokenAsTSO4 = signInAsTSO4.authToken


* def getCard = 
    """
    function() {
        pastStartDate = new Date().valueOf() - 18*60*60*1000;
        pastEndDate = new Date().valueOf() - 14*60*60*1000;
        startDate = new Date().valueOf() + 4*60*60*1000;
        endDate = new Date().valueOf() + 8*60*60*1000;
        var card = {
          "publisher" : "operator1_fr",
          "processVersion" : "1",
          "process"  :"api_test",
          "processInstanceId" : "process1",
          "state": "messageState",
          "groupRecipients": ["Dispatcher", "Planner"],
          "severity" : "ACTION",
          "startDate" : startDate,
          "endDate" : endDate,
          "summary" : {"key" : "message.summary"},
          "title" : {"key" : "message.title"},
          "data" : {"message":" Action Card"}
        }
        return JSON.stringify(card);
      }
    """
    * def card = call getCard

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

  Scenario: Create perimeter and attach it to group ReadOnly
#Create new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    When method post
    Then status 201

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterArray
    When method patch
    Then status 200

    Scenario: get card subscription 
      Given url opfabUrl + 'cards/cardSubscription' +'?clientId=abc0123456789def'
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then status 200
      And match response == ''

    Scenario: Without authentication
      Given url opfabUrl + 'cards/cardSubscription'
      When method get
      Then status 401

    Scenario: get card subscription with user operator1_fr

    # Push card
      Given url opfabPublishCardUrl + 'cards'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      And header Content-Type = 'application/json'
      And request card
      When method post
      Then status 201

    # Get card uid
      Given url opfabUrl + 'cards/cards/api_test.process1'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And def cardUid = response.card.uid

    # Get subscription with past range and check that no card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ pastStartDate + '&rangeEnd=' + pastEndDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response == ''

    # Get subscription and check that card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ startDate + '&rangeEnd=' + endDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response contains '"card":{"uid":"' + cardUid + '"'

    # delete card
      Given url opfabPublishCardUrl + 'cards/api_test.process1'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method delete
      Then status 200

      
    # Get subscription and check that no card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&rangeStart='+ startDate + '&rangeEnd=' + endDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response == ''





    Scenario: get card subscription by publishDate should return also newly acked cards

    * def cardPublishDate = new Date().valueOf();
    * def entity1Array =
    """
    [   "ENTITY1_FR"
    ]
    """

    # Push card
      Given url opfabPublishCardUrl + 'cards'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      And header Content-Type = 'application/json'
      And request card
      When method post
      Then status 201
      And def cardUid = response.uid

    # Get subscription and check that card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&publishFrom='+ cardPublishDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response contains '"card":{"uid":"' + cardUid + '"'

    * def cardAckDate = new Date().valueOf();

      # Get subscription and check that no card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&publishFrom=' + cardAckDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response == ''

    # make an acknowledgement to the card with operator4_fr
      Given url opfabUrl + 'cardspub/cards/userAcknowledgement/' + cardUid
      And header Authorization = 'Bearer ' + authTokenAsTSO4
      And request entity1Array
      When method post
      Then status 201


    # Get subscription and check that card is returned
      Given url opfabUrl + 'cards/cardSubscription' +'?notification=false&clientId=ghi0123456789jkl&publishFrom='+ cardAckDate
      And header Authorization = 'Bearer ' + authTokenAsTSO
      When method get
      Then status 200
      And match response contains '"card":{"uid":"' + cardUid + '"'



    #delete perimeter created previously
      Given url opfabUrl + 'users/perimeters/perimeter'
      And header Authorization = 'Bearer ' + authToken
      When method delete
      Then status 200
