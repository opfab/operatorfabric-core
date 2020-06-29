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
			"processId" : "processProcess",
			"state": "processState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "process.title"},
			"data" : {"state":"calcul2","stateName":"CALCUL2","error":"true"},
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



