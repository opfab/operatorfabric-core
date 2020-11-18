Feature: Cards with timespans 

  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken

  Scenario: Post a card with timepans and recurrence

    * def card =
"""
{
	"publisher" : "api_test",
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
						"hoursAndMinutes": [{"hours":10,"minutes":20},{"hours":12,"minutes":58}]
					}
		},
		{"start" : 1553186770678}
		]
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


  Scenario: Delete the card

#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.processTimeSpan'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
	And match response.card.data.message == 'a message'
	And match response.card.timeSpans[0].start == 1553186770681
	And match response.card.timeSpans[0].end == 1553186770682
	And match response.card.timeSpans[0].recurrence.timeZone == "test"
	And match response.card.timeSpans[0].recurrence.daysOfWeek[1] == 3
	And match response.card.timeSpans[0].recurrence.hoursAndMinutes[1].hours == 12
	And match response.card.timeSpans[0].recurrence.hoursAndMinutes[1].minutes == 58
	

 #delete card
    Given url opfabPublishCardUrl + 'cards/api_test.processTimeSpan'
    When method delete
    Then status 200


Scenario: When post a card with no timeZone in timespan recurrence , it set the value to default (Europe/paris) 

    * def card =
"""
{
	"publisher" : "api_test",
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
						"hoursAndMinutes": [{"hours":10,"minutes":20},{"hours":12,"minutes":58}]
					}
		},
		{"start" : 1553186770678}
		]
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1


#get card with user operator1
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
    When method delete
    Then status 200


  Scenario: When post card with no hoursAndMinutes in recurrencen the card is not accepted

    * def card =
"""
{
	"publisher" : "api_test",
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
    And request card
    When method post
    Then response.count == 0
