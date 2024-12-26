Feature: Cards with timespans 

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

    * def cardToTestBadRequest1 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
}
"""

    * def cardToTestBadRequest2 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
}
"""

    * def cardToTestBadRequest3 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
}
"""


    * def cardToTestBadRequest4 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"secondsBeforeTimeSpanForReminder" :1000,
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
}
"""


    * def cardToTestBadRequest5 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"secondsBeforeTimeSpanForReminder" :-1000,
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
}
"""

  Scenario: Post a card with timepans

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "processTimeSpan",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"},
	"secondsBeforeTimeSpanForReminder" :1000,
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770681 ,"end" :1553186770682},
		{"start" : 1553186770678}
		]
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

#get card with user operator1_fr
    Given url opfabUrl + 'cards-consultation/cards/api_test.processTimeSpan'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And match response.card.data.message == 'a message'
	And match response.card.timeSpans[0].start == 1553186770681
	And match response.card.timeSpans[0].end == 1553186770682
	And match response.card.secondsBeforeTimeSpanForReminder == 1000
	

 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processTimeSpan'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario Outline: Bad request with constraint violation on TimeSpan object
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request <cardToTestBadRequest>
    When method post
    Then status 400
    And match response.status == "BAD_REQUEST"
    And match response.message contains "Constraint violation in the request"
    And match response.errors[0] contains  <expectedMessage>

    Examples:
      | cardToTestBadRequest  | expectedMessage                                                                                 |
      | cardToTestBadRequest5 | "secondsBeforeTimeSpanForReminder: must be greater than or equal to 0" |


  Scenario: delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
