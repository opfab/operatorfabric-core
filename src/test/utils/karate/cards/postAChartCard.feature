Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Push card with a chart 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

	  startDateTimeSpans = new Date().valueOf() + 2*60*60*1000;
	  endDateTimeSpans = new Date().valueOf() +   5*30*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process2",
			"state": "chartState",
			"tags" : ["tag2"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "chartDetail.title"},
			"data" : {"values":[12, 19, 3, 5, 2, 3]},
			"timeSpans" : [
				{"start" : startDateTimeSpans,"end" : endDateTimeSpans}
				]
		}

	return JSON.stringify(card);

      }
    """
    * def card = call getCard 


Given url opfabPublishCardUrl + 'cards' 

And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1

