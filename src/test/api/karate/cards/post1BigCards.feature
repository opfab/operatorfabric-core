Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
  * def authToken = signIn.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken

Scenario: Post a big Card

* def card = read("resources/bigCard.json")

  * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "APOGEESEA",
  "stateRights" : [
      {
        "state" : "APOGEESEA",
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

# Push a big  card 
Given url opfabPublishCardUrl + 'cards' 
And header Authorization = 'Bearer ' + authToken 
And request card  
When method post
Then status 201


#get card with user operator1
Given url opfabUrl + 'cards/cards/APOGEESEA.SEA0' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid


#get card from archives with user operator1
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200

#delete perimeter created previously
Given url opfabUrl + 'users/perimeters/perimeter'
And header Authorization = 'Bearer ' + authTokenAdmin
When method delete
Then status 200




