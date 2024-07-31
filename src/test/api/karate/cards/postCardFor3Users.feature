Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
  * def authToken = signIn.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken
  * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

  * def perimeterArray =
"""
[   "perimeter"
]
"""

Scenario: Post Card


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
				"publisher" : "operator1_fr",
				"processVersion" : "1",
				"process"  :"api_test",
				"processInstanceId" : "process3users",
				"state": "messageState",
				"userRecipients": ["operator1_fr", "operator2_fr", "admin"],
				"severity" : "INFORMATION",
				"startDate" : startDate,
				"summary" : {"key" : "defaultProcess.summary"},
				"title" : {"key" : "defaultProcess.title"},
				"data" : {"message":"a message for 3 users (operator1_fr, operator2_fr and admin)"}
			}
	return JSON.stringify(card);

      }
    """
    * def card = call getCard

#Create new perimeter
* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
  Given url opfabUrl + 'users/groups/Maintainer/perimeters'
  And header Authorization = 'Bearer ' + authTokenAdmin
  And request perimeterArray
  When method patch
  Then status 200


# Push card 
Given url opfabPublishCardUrl + 'cards' 
And header Authorization = 'Bearer ' + authToken 
And request card  
And header Content-Type = 'application/json'
When method post
Then status 201

#get card with user operator1_fr
Given url opfabUrl + 'cards-consultation/cards/api_test.process3users' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message for 3 users (operator1_fr, operator2_fr and admin)'
And def cardUid = response.card.uid


#get card from archives with user operator1_fr
Given url opfabUrl + 'cards-consultation/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message for 3 users (operator1_fr, operator2_fr and admin)'

#delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}

