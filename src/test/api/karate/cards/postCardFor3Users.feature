Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken

Scenario: Post Card


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
				"publisher" : "operator1",
				"processVersion" : "1",
				"process"  :"api_test",
				"processInstanceId" : "process3users",
				"state": "messageState",
				"userRecipients": ["operator1", "operator2", "admin"],
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

  * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "Receive"
      }
    ]
}
"""

  * def perimeterArray =
"""
[   "perimeter"
]
"""

#Create new perimeter
  Given url opfabUrl + 'users/perimeters'
  And header Authorization = 'Bearer ' + authTokenAdmin
  And request perimeter
  When method post
  Then status 201

#Attach perimeter to group
  Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
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

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process3users' 
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

#delete perimeter created previously
  Given url opfabUrl + 'users/perimeters/perimeter'
  And header Authorization = 'Bearer ' + authTokenAdmin
  When method delete
  Then status 200

