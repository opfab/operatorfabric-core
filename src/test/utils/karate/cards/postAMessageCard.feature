Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post a message card 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process1",
			"state": "messageState",
			"tags":["tag1"],
			"groupRecipients": ["Dispatcher"],
			"severity" : "INFORMATION",
			"startDate" : startDate,
			"endDate" : endDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "message.title"},
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


