Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post a process card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  
	  startDateTimeSpans1 = new Date().valueOf() + 12*60*60*1000;
	  endDateTimeSpans1 = new Date().valueOf() + 13*60*60*1000;

	  startDateTimeSpans2 = new Date().valueOf() + 48*60*60*1000;
	  endDateTimeSpans2 = new Date().valueOf() + 49*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process3",
			"state": "processState",
			"tags":["tag1", "tag2"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "COMPLIANT",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "processState.title" , "parameters" : {"status":"calcul"}},
			"data" : {"state":"calcul1","stateName":"CALCUL1"},
			"timeSpans" : [
				{"start" : startDateTimeSpans1,"end" : endDateTimeSpans1},
				{"start" : startDateTimeSpans2,"end" : endDateTimeSpans2 }
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

