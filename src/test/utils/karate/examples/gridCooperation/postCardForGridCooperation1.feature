Feature: Cards


Background: 

  * def signIn = call read('../../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post card with old version of bundle 


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
			"publisher" : "publisher_test",
			"processVersion" : "3",
			"process"  :"gridCooperation",
			"processInstanceId" : "process1",
			"state": "action-FrEs-IGCC-export-300",
			"groupRecipients": ["Dispatcher"],
			"severity" : "ACTION",
			"startDate" : startDate,
			"summary" : {"key" : "action-FrEs-IGCC-export-300.summary"},
			"title" : {"key" : "action-FrEs-IGCC-export-300.title"},
			"data" : {"message":" Information card number 1"},
			"timeSpans" : [
				{"start" : startDate},
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


