Feature: fetchArchive

  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authToken = signIn.authToken
    * def signInTSO2 = call read('../common/getToken.feature') { username: 'tso2-operator'}
    * def authTokenTSO2 = signInTSO2.authToken

  Scenario: fetchArchive

    * def card =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process_archive_1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
	"severity" : "ALARM",
	"startDate" : 1583943924000,
	"endDate" : 1584943924000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


#get card with user tso1-operator
    Given url opfabUrl + 'cards/cards/api_test_process_archive_1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message'
    And def cardUid = response.card.uid

#get card form archives with user tso1-operator

    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'a message'

# get card form archives without authentication


    Given url opfabUrl + 'cards/archives/' + cardUid
    When method get
    Then status 401


# get card form archives with user tso2-operator


    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authTokenTSO2
    When method get
    Then status 404


    Scenario: fetchArchiveCard with new attribute externalRecipients

        * def card =
"""
{
	"publisher" : "api_test123",
	"processVersion" : "1",
	"process"  :"defaultProcess",
	"processId" : "process1",
	"state": "messageState",
	"recipient" : {
				"type" : "GROUP",
				"identity" : "TSO1"
			},
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
        And request card
        When method post
        Then status 201
        And match response.count == 1


#get card with user tso1-operator
        Given url opfabUrl + 'cards/cards/api_test123_process1'
        And header Authorization = 'Bearer ' + authToken
        When method get
        Then status 200
        And match response.card.externalRecipients[1] == "api_test16566111"
        And def cardUid = response.uid
