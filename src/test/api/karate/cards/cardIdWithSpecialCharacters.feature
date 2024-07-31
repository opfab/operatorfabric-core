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


  Scenario: Delete the card


 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.process%3Bsemicolon'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  #delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
