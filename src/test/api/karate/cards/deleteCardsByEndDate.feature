Feature: Delete Cards by end date before


  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post 4 cards and  delete

    * def card1 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770000,
	"endDate" : 1553186780000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
    * def card2 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 1)"}
}
"""
    * def card3 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186770000,
	"endDate" : 1553186880999,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
"""
    * def card4 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card3",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "COMPLIANT",
	"startDate" : 1553186990000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
"""

# Push 4 card
    Given url opfabPublishCardUrl + 'cards'
    And request card1
    When method post
    Then status 201

    Given url opfabPublishCardUrl + 'cards'
    And request card2
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card3
    When method post
    Then status 201

    Given url opfabPublishCardUrl + 'cards'
    And request card4
    When method post
    Then status 201

  Scenario: Delete the cards before date as admin

# delete all cards before date
    Given url opfabPublishCardUrl + 'cards?' + 'endDateBefore=1553186800000'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

#get deleted card should return NOT_FOUND
    Given url opfabUrl + 'cards/cards/api_test.process1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404

#get deleted card should return NOT_FOUND
    Given url opfabUrl + 'cards/cards/api_test.process2card1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 404

#get card with user operator1 
    Given url opfabUrl + 'cards/cards/api_test.process2card2'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200

#get card with user operator1 
    Given url opfabUrl + 'cards/cards/api_test.process2card3'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200

# delete remaing card
	Given url opfabPublishCardUrl + 'cards/api_test.process2card2'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

# delete remaing card
	Given url opfabPublishCardUrl + 'cards/api_test.process2card3'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200