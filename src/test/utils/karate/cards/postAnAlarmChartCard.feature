Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post an alarm card with a graph 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 1*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process5",
			"state": "chartLineState",
			"groupRecipients": ["Dispatcher", "Planner"],
			"severity" : "ALARM",
			"startDate" : startDate,
			"summary" : {"key" : "message.summary"},
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

