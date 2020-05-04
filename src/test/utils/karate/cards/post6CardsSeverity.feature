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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process2",
			"state": "messageState",
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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process2b",
			"state": "messageState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" Information card number 2"},
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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process3",
			"state": "messageState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "COMPLIANT",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" Compliant Card "},
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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process4",
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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process5",
			"state": "messageState",
			"recipient" : {
						"type" : "GROUP",
						"identity" : "TSO1"
					},
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "defaultProcess.summary"},
			"title" : {"key" : "defaultProcess.title"},
			"data" : {"message":" First Alarm card"},
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
			"publisherVersion" : "1",
			"process"  :"defaultProcess",
			"processId" : "process5b",
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
