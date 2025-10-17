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

Scenario: Check Archives / must insert 10 cards first with other scenarios

#Create new perimeter
* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
  Given url opfabUrl + 'users/groups/Maintainer/perimeters'
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

  Given url opfabUrl + 'cards-consultation/archives'
  And header Authorization = 'Bearer ' + authToken
  And request filter1
  Then method post
  Then status 200
  And match response.size == 10
  And match response.totalPages == '#?  response.totalPages > 1'
  And match response.totalElements == '#?  response.totalElements > 10'

#delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}

