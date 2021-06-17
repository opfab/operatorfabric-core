Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken

Scenario: Post Card

* def card =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

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
When method post
Then status 201

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message'
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message'

Scenario: Post a new version of the Card

* def card =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card 
Given url opfabPublishCardUrl + 'cards'
And header Authorization = 'Bearer ' + authToken  
And request card  
When method post
Then status 201

#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'new message'
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'


Scenario: Delete the card 


#get card with user operator1
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid

# delete card
Given url opfabPublishCardUrl + 'cards/api_test.process1'
And header Authorization = 'Bearer ' + authToken 
When method delete
Then status 200

#get card with user operator1 should return 404
Given url opfabUrl + 'cards/cards/api_test.process1' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 404

#get card from archives with user operator1 is possible
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'new message'

#delete perimeter created previously
  Given url opfabUrl + 'users/perimeters/perimeter'
  And header Authorization = 'Bearer ' + authTokenAdmin
  When method delete
  Then status 200
