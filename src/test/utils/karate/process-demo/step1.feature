Feature: Process Cards


Scenario: Step1 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "processProcess",
			"state": "processState",
			"groupRecipients": ["Dispatcher"],
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "process.title"},
			"data" : {"state":"start","stateName":"STARTING"},
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



