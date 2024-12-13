Feature: fetchArchive

  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInTSO2 = callonce read('../common/getToken.feature') { username: 'operator2_it'}
    * def authTokenTSO2 = signInTSO2.authToken
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

  Scenario: fetchArchive

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process_archive_1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583943924000,
	"endDate" : 1584943924000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
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


#get card with user operator1_fr
    Given url opfabUrl + 'cards-consultation/cards/api_test.process_archive_1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message'
    And def cardUid = response.card.uid

#get card form archives with user operator1_fr

    Given url opfabUrl + 'cards-consultation/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message'
    And match response.card.titleTranslated == 'card Title'
    And match response.card.summaryTranslated == 'card summary'

# get card form archives without authentication


    Given url opfabUrl + 'cards-consultation/archives/' + cardUid
    When method get
    Then status 401


# get card form archives with user operator2_fr
    Given url opfabUrl + 'cards-consultation/archives/' + cardUid
    And header Authorization = 'Bearer ' + authTokenTSO2
    When method get
    Then status 404


    Scenario: fetchArchiveCard with new attribute externalRecipients

        * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["externalRecipient1","externalRecipient2"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title2"},
	"data" : {"message":"a message"}
}
"""

# Push card
        Given url opfabPublishCardUrl + 'cards'
        And header Authorization = 'Bearer ' + authToken
        And request card
        When method post
        Then status 201


#get card with user operator1_fr
        Given url opfabUrl + 'cards-consultation/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And match response.card.externalRecipients[1] == "externalRecipient2"
        And def cardUid = response.uid

#delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
