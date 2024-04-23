Feature: CardsUserRead


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signIn2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authToken2 = signIn2.authToken
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

    Scenario: CardsUserRead

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

#get card with user operator1_fr and check it hasn't been read yet
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And def uid = response.card.uid


#Signal that card has been read card by operator1_fr
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    And request ''
    When method post
    Then status 201

#get card with user operator1_fr and check hasBeenRead is set to true
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.uid == uid



#get card with user operator2_fr and check hasBeenRead is set to false
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.uid == uid


#Signal that card has been read card by operator2_fr
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken2
    And request ''
    When method post
    Then status 201

#get card with user operator1_fr and check hasBeenRead is still set to true
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.uid == uid

 

    # Get lighcard and check it contains usersReads
    * def filter =
    """
    {
      "page" : 0,
      "size" : 10,
      "filters" : [
        {
          "columnName": "processInstanceId",
          "filter" : ["process1"],
          "matchType": "EQUALS"
        }
      ]
    }
    """

    Given url opfabUrl + 'cards/cards'
    And header Authorization = 'Bearer ' + authToken
    And request filter
    Then method post
    Then status 200
    And assert response.numberOfElements == 1
    And assert response.content[0].usersReads.length == 2
    And match response.content[0].usersReads[0] == "operator1_fr"
    And match response.content[0].usersReads[1] == "operator2_fr"

# Delete user read
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.hasBeenRead == false
    And match response.card.uid == uid

#get card with user operator2_fr and check hasBeenRead is still set to true
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken2
    When method get
    Then status 200
    And match response.card.hasBeenRead == true
    And match response.card.uid == uid

    # Read a card that has already been read
    Given url opfabUrl + 'cardspub/cards/userCardRead/' + uid
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Given url opfabUrl + 'cardspub/cards/userCardRead/unexisting_card____uid'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404
    
  Scenario: Delete the test card

    delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process1'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
