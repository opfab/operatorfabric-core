Feature: fetchArchive

  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken
    * def signInTSO2 = callonce read('../common/getToken.feature') { username: 'operator2'}
    * def authTokenTSO2 = signInTSO2.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

  Scenario: fetchArchive

    * def card =
"""
{
	"publisher" : "operator1",
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

    * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "Receive"
      }
    ]
}
"""

    * def perimeterArray =
"""
[   "perimeter"
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


#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.process_archive_1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message'
    And def cardUid = response.card.uid

#get card form archives with user operator1

    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'a message'
    And match response.titleTranslated == 'card Title'
    And match response.summaryTranslated == 'card summary'

# get card form archives without authentication


    Given url opfabUrl + 'cards/archives/' + cardUid
    When method get
    Then status 401


# get card form archives with user operator2


    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authTokenTSO2
    When method get
    Then status 404


    Scenario: fetchArchiveCard with new attribute externalRecipients

        * def card =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"externalRecipients" : ["api_test2","api_test16566111"],
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


#get card with user operator1
        Given url opfabUrl + 'cards/cards/api_test.process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And match response.card.externalRecipients[1] == "api_test16566111"
        And def cardUid = response.uid

#delete perimeter created previously
        Given url opfabUrl + 'users/perimeters/perimeter'
        And header Authorization = 'Bearer ' + authTokenAdmin
        When method delete
        Then status 200
