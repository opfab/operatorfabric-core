Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken

Scenario: Post Card


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
				"publisher" : "api_test",
				"processVersion" : "1",
				"process"  :"api_test",
				"processInstanceId" : "process3usersDep",
				"state": "messageState",
				"recipient": {
							"type":"UNION",
							"recipients":[
								{ "type": "USER", "identity":"operator1"},
								{ "type": "USER", "identity":"operator2"},
								{ "type": "USER", "identity":"admin"}
							]
					},
				"severity" : "INFORMATION",
				"startDate" : startDate,
				"summary" : {"key" : "defaultProcess.summary"},
				"title" : {"key" : "defaultProcess.title"},
				"data" : {"message":"a message for 3 users (operator1, operator2 and admin)"}
			}
	return JSON.stringify(card);

      }
    """
    * def card = call getCard 




# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
And header Content-Type = 'application/json'
When method post
Then status 201

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process3usersDep' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message for 3 users (operator1, operator2 and admin)'
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message for 3 users (operator1, operator2 and admin)'

