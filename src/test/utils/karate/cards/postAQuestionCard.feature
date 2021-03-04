Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post a question card



    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 4*60*60*1000;
	  lttdDate = new Date().valueOf() + 60*1000*3;
	  endDate = new Date().valueOf() + 8*60*60*1000;

		var card = {
			"publisher" : "processAction",
			"processVersion" : "1",
			"process"  :"defaultProcess",
			"processInstanceId" : "process4",
			"state": "questionState",
			"groupRecipients": ["Dispatcher", "Planner"],
			"entitiesAllowedToRespond": ["ENTITY1","ENTITY2","ENTITY3"],
			"entitiesRequiredToRespond": ["ENTITY1","ENTITY2"],
			"severity" : "ACTION",
			"startDate" : startDate,
			"endDate" : endDate,
			"summary" : {"key" : "message.summary"},
			"title" : {"key" : "question.title"},
			"data" : {"message":" Action Card"},
			"lttd" : lttdDate,
			"timeSpans" : [
				{"start" : startDate ,"end" : endDate}
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

