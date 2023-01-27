Feature: Cards


Background: 

  * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
  * def authToken = signIn.authToken
  * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
  * def authTokenAdmin = signInAdmin.authToken

Scenario: Check Archives / must insert 10 cards first with other scenarios

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


#get cards from archives with user operator1_fr

* def filter1 =
"""
{
  "page" : 0,
  "size" : 10,
  "filters" : []
}
"""

  Given url opfabUrl + 'cards/archives'
  And header Authorization = 'Bearer ' + authToken
  And request filter1
  Then method post
  Then status 200
  And match response.size == 10
  And match response.totalPages == '#?  response.totalPages > 1'
  And match response.totalElements == '#?  response.totalElements > 10'

#delete perimeter created previously
  Given url opfabUrl + 'users/perimeters/perimeter'
  And header Authorization = 'Bearer ' + authTokenAdmin
  When method delete
  Then status 200

