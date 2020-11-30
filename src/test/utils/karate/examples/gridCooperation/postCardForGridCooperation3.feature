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
			"state": "compliant-FrEs-IGCC",
			"groupRecipients": ["Dispatcher"],
			"severity" : "COMPLIANT",
			"startDate" : startDate,
			"summary" : {"key" : "compliant-FrEs-IGCC.summary"},
			"title" : {"key" : "compliant-FrEs-IGCC.title"},
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


