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
  "process" : "APOGEESEA",
  "stateRights" : [
      {
        "state" : "APOGEESEA",
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

Scenario: Post a big Card

* def card = read("resources/bigCard.json")

#Create new perimeter
* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
  Given url opfabUrl + 'users/groups/Maintainer/perimeters'
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


#get card with user operator1_fr
Given url opfabUrl + 'cards-consultation/cards/APOGEESEA.SEA0' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And def cardUid = response.card.uid


#get card from archives with user operator1_fr
Given url opfabUrl + 'cards-consultation/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200

#delete perimeter created previously
* callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}




