Feature: Cards with timespans 

  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

  Scenario: Post a card with timepans and recurrence

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
		{"start" : 1553186770681 ,"end" :1553186770682 , "recurrence" :
					{
						"timeZone":"test",
						"daysOfWeek":[2,3],
						"hoursAndMinutes": {"hours":10,"minutes":20},
						"durationInMinutes": 30
					}
		},
		{"start" : 1553186770681 ,"end" :1553186770682 , "recurrence" :
					{
						"timeZone":"test",
						"daysOfWeek":[4,5],
						"hoursAndMinutes": {"hours":12,"minutes":22}
					}
		},
		{"start" : 1553186770678}
		]
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


  Scenario: Delete the card

#get card with user operator1_fr
    Given url opfabUrl + 'cards/cards/api_test.processTimeSpan'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And match response.card.data.message == 'a message'
	And match response.card.timeSpans[0].start == 1553186770681
	And match response.card.timeSpans[0].end == 1553186770682
	And match response.card.secondsBeforeTimeSpanForReminder == 1000
	And match response.card.timeSpans[0].recurrence.timeZone == "test"
	And match response.card.timeSpans[0].recurrence.durationInMinutes == 30
	And match response.card.timeSpans[0].recurrence.daysOfWeek[1] == 3
	And match response.card.timeSpans[0].recurrence.hoursAndMinutes.hours == 10
	And match response.card.timeSpans[0].recurrence.hoursAndMinutes.minutes == 20
	And match response.card.timeSpans[1].recurrence.daysOfWeek[0] == 4
	And match response.card.timeSpans[1].recurrence.hoursAndMinutes.hours == 12
	And match response.card.timeSpans[1].recurrence.hoursAndMinutes.minutes == 22
	

 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processTimeSpan'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


Scenario: When post a card with no timeZone in timespan recurrence , it set the value to default (Europe/paris) 

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
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682 , "recurrence" :
					{
						"daysOfWeek":[2,3],
						"hoursAndMinutes": {"hours":10,"minutes":20}
					}
		},
		{"start" : 1553186770678}
		]
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201


#get card with user operator1_fr
    Given url opfabUrl + 'cards/cards/api_test.processTimeSpan'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And match response.card.data.message == 'a message'
	And match response.card.timeSpans[0].start == 1553186770681
	And match response.card.timeSpans[0].end == 1553186770682
	And match response.card.timeSpans[0].recurrence.timeZone == "Europe/Paris"
	And match response.card.timeSpans[0].recurrence.daysOfWeek[1] == 3
	

 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processTimeSpan'
	And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: When post card with no hoursAndMinutes in recurrence, the card is not accepted

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
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682 , "recurrence" :
					{
						"timeZone":"test",
						"daysOfWeek":[2,3]
					}
		},
		{"start" : 1553186770678}
		]
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then response.count == 0


  Scenario: When post card with no hours and minutes in recurrence, the card is not accepted

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
	"timeSpans" : [
		{"start" : 1553186770681 ,"end" :1553186770682 , "recurrence" :
					{
						"timeZone":"test",
						"daysOfWeek":[2,3],
						"hoursAndMinutes": {"hours":"","minutes":""}
					}
		},
		{"start" : 1553186770678}
		]
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 400
    And match response.message contains "Constraint violation in the request"
    And match response.errors[0] contains "constraint violation : TimeSpan.Recurrence.HoursAndMinutes must be filled"

#delete perimeter created previously
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200
