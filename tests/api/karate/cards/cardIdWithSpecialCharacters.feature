Feature: Cards with special character in id

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

  Scenario: Post a card with semicolon in processInstanceId

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process;semicolon",
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
    Given url opfabUrl + 'users/groups/Maintainer/perimeters'
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

# Get card using new query parameter endpoint
    Given url opfabUrl + 'cards-consultation/cards'
    And param cardId = 'api_test.process;semicolon'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.process == 'api_test'
    And match response.card.processInstanceId == 'process;semicolon'


  Scenario: Delete the card using new query parameter endpoint (tests semicolon)

 #delete card with query parameter
    Given url opfabPublishCardUrl + 'cards'
    And param cardId = 'api_test.process;semicolon'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200



  Scenario: Post a card with slash in processInstanceId

    * def cardWithSlash =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process/slash",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message with slash in processInstanceId"},
	"representative" : "ENTITY1_FR",
	"representativeType" : "ENTITY"
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request cardWithSlash
    When method post
    Then status 201

# Get card using new query parameter endpoint (tests slash)
    Given url opfabUrl + 'cards-consultation/cards'
    And param cardId = 'api_test.process/slash'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.process == 'api_test'
    And match response.card.processInstanceId == 'process/slash'


  Scenario: Delete the card with slash using new query parameter endpoint

 #delete card with slash using query parameter
    Given url opfabPublishCardUrl + 'cards'
    And param cardId = 'api_test.process/slash'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: Test deprecated path-based endpoint (for backward compatibility)

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processInstanceId",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"testing deprecated endpoint"},
	"representative" : "ENTITY1_FR",
	"representativeType" : "ENTITY"
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201

# Get card using deprecated path-based endpoint 
    Given url opfabUrl + 'cards-consultation/cards/api_test.processInstanceId'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200

 #delete card using deprecated path-based endpoint
    Given url opfabPublishCardUrl + 'cards/api_test.processInstanceId'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  #delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
