Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post 6 Cards (2 INFORMATION, 1 COMPLIANT, 1 ACTION, 2 ALARM)


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process1",
			"state": "messageState",
			"tags":["test","test2"],
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" Information card number 1"},
			"timeSpans" : [
				{"start" : startDate},
				{"start" : endDate}
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





# Push a second information card 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process2",
			"state": "chartState",
			"tags" : ["test2"],
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "chartDetail.title"},
			"data" : {"values":[12, 19, 3, 5, 2, 3]},
			"timeSpans" : [
				{"start" : startDate},
				{"start" : endDate}
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


# Push a compliant card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  endDate = new Date().valueOf() + 12*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process3",
			"state": "processState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "COMPLIANT",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "process.title"},
			"data" : {"state":"calcul1","stateName":"CALCUL1"},
			"timeSpans" : [
				{"start" : startDate},
				{"start" : endDate}
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


# Push an action card 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  endDate = new Date().valueOf() + 6*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process4",
			"state": "messageState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "ACTION",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" Action Card"},
			"timeSpans" : [
				{"start" : startDate},
				{"start" : endDate}
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

# Push an alarm card

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 1*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process5",
			"state": "chartLineState",
			"recipient" : {
					"type":"UNION",
					"recipients":[
						{ "type": "GROUP", "identity":"TSO1"},
						{ "type": "GROUP", "identity":"TSO2"}
						]
					},
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "chartLine.title"},
			"data" : {"values":[10000, 11000, 30000, 45000, 30000, 35000,10000]}
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

# Push an second  alarm card later 

    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
			"publisher" : "api_test",
			"processVersion" : "1",
			"process"  :"api_test",
			"processInstanceId" : "process6",
			"state": "messageState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" Second Alarm card"},
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
