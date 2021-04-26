Feature: Archives


  Background:

    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post 10 cards, fill the archive
    * def card1 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733122000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 1)"}
}
"""
	* def card2 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ACTION",
	"startDate" : 1583333122000,
	"lttd" : 1583339602000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
"""
	* def card3 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card3",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121993,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 3)"}
}
"""
	* def card4 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card4",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121994,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card4) "}
}
"""
	* def card5 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card5",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121995,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 5)"}
}
"""
	* def card6 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card6",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121996,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 6) "}

}
"""
	* def card7 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card7",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121997,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 7)"}
}
"""
	* def card8 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card8",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121998,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card8) "}
}
"""
	* def card9 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card9",
	"endDate" : 1583733122000,
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121999,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 9)"}
}
"""
	* def card10 =
"""
{
	"publisher" : "api_test",
	"processVersion" : "1",
	"parentCardId" : "api_test.process2card9",
	"process"  :"api_test",
	"processInstanceId" : "process2card10",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733122000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card10) "}
}
"""
    * def mycard =
"""
{
	"publisher" : "api_test",
	"processVersion" : "2",
	"process"  :"api_test",
	"processInstanceId" : "process10",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"timespans test"},
	"startDate" : 1583568831000,
	"timeSpans" : [
        {"start" : 1583568831000},
        {"start" : 1583578831000}
    	]
}
"""
# Push cards
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

	Given url opfabPublishCardUrl + 'cards'
    And request card5
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card6
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card7
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card8
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card9
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
    And request card10
    When method post
    Then status 201

 Scenario: fetch the first page

    Given url opfabUrl + 'cards/archives/' +'?page=0'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    Then method get
    Then status 200
    And match response.numberOfElements == 9

    Scenario: change number of elements

    Given url opfabUrl + 'cards/archives/' +'?size=5'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.size == 5
    And match response.numberOfElements == 5

    Scenario: filter on a given publisher

    Given url opfabUrl + 'cards/archives/' +'?publisher=api_test'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 9

   Scenario: without authentication
    Given url opfabUrl + 'cards/archives/' +'?publisher=api_test'
    When method get
    Then status 401

   Scenario: filter on tag
      Given url opfabUrl + 'cards/archives/' +'?tags=API'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200

   Scenario: filter on a given publish date
    Given url opfabUrl + 'cards/archives/' +'?publishDateFrom=1553186770481'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 9

   Scenario: filter by activeFrom
    Given url opfabUrl + 'cards/archives/' +'?activeFrom=1553186770481'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
     And assert response.numberOfElements == 9

   Scenario: filter by activeFrom after startDate of card with no endDate
    Given url opfabUrl + 'cards/archives/' +'?activeFrom=1583333123000'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
     And assert response.numberOfElements == 8

   Scenario: filter by activeTo
     Given url opfabUrl + 'cards/archives/' +'?activeTo=1653186770481'
     And header Authorization = 'Bearer ' + authTokenAsTSO
     When method get
     Then status 200
     And assert response.numberOfElements == 9

  Scenario: filter process
    Given url opfabUrl + 'cards/archives/' +'?process=api_test'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 9

  Scenario: fetch all archived cards, child cards included
    Given url opfabUrl + 'cards/archives/' +'?childCards=true'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 10

  Scenario: fetch archived cards, child cards excluded
    Given url opfabUrl + 'cards/archives/' +'?childCards=false'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 9

  Scenario: fetch archived cards (child cards excluded by default)
    Given url opfabUrl + 'cards/archives/'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And assert response.numberOfElements == 9
