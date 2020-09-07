Feature: Update list of perimeter groups (endpoint tested : PUT /perimeters/{id}/groups)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining perimeters
    * def perimeter = 'perimeterKarate4'

    * def perimeterKarate4 =
"""
{
   "id" : "perimeterKarate4",
   "process" : "process4",
   "stateRights" : [
     {
       "state" : "state1",
       "right" : "Receive"
     }
   ]
}
"""

    # defining groups to create
    # defining groups to create
    * def groupKarate7 =
"""
{
   "id" : "groupKarate7",
   "name" : "groupKarate7 name",
   "description" : "groupKarate7 description"
}
"""

    * def groupKarate8 =
"""
{
   "id" : "groupKarate8",
   "name" : "groupKarate8 name",
   "description" : "groupKarate8 description"
}
"""

    * def groupKarate9 =
"""
{
   "id" : "groupKarate9",
   "name" : "groupKarate9 name",
   "description" : "groupKarate9 description"
}
"""

    * def groupKarate9List =
"""
[
"groupKarate9"
]
"""

    * def group7group8List =
"""
[
"groupKarate7", "groupKarate8"
]
"""

    * def wrongGroupsArray =
"""
[
"groupKarate1", "groupKarateNotExisting"
]
"""


  Scenario: Create Perimeter
  #Create new perimeter (check if the perimeter already exists otherwise it will return 200)
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterKarate4
    When method post
    Then status 201
    And match response.id == perimeterKarate4.id
    And match response.process == perimeterKarate4.process
    And match response.stateRights == perimeterKarate4.stateRights


  Scenario: Create groupKarate7
    #post /groups
    #create new group, expected response 201
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate7
    When method post
    Then status 201
    And match response.id == groupKarate7.id
    And match response.name == groupKarate7.name
    And match response.description == groupKarate7.description


  Scenario: Create groupKarate8
    #post /groups
    #create new group, expected response 201
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate8
    When method post
    Then status 201
    And match response.id == groupKarate8.id
    And match response.name == groupKarate8.name
    And match response.description == groupKarate8.description


  Scenario: Create groupKarate9
    #post /groups
    #create new group, expected response 201
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate9
    When method post
    Then status 201
    And match response.id == groupKarate9.id
    And match response.name == groupKarate9.name
    And match response.description == groupKarate9.description


  Scenario: Add groupKarate9 to the perimeter
    Given url opfabUrl + 'users/perimeters/' + perimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate9List
    When method patch
    And status 200


  Scenario: Check that groupKarate9 has the perimeter
    Given url opfabUrl + 'users/groups/' + groupKarate9.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id == perimeterKarate4.id
    And match response[0].process == perimeterKarate4.process
    And match response[0].stateRights == perimeterKarate4.stateRights


  Scenario: Update list of perimeter groups without authentication
    Given url opfabUrl + 'users/perimeters/'+ perimeter + '/groups'
    And request group7group8List
    When method put
    Then status 401


  Scenario: Update list of perimeter groups with user other than admin
    Given url opfabUrl + 'users/perimeters/'+ perimeter + '/groups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request group7group8List
    When method put
    Then status 403


  Scenario: Update list of a nonexistent perimeter
    Given url opfabUrl + 'users/perimeters/fake/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group7group8List
    When method put
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Perimeter fake not found'


  Scenario: Add bad groups list to a perimeter (one group in the list doesn't exist)
    Given url opfabUrl + 'users/perimeters/' + perimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongGroupsArray
    When method put
    And status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Bad group list : group groupKarateNotExisting not found'


  #Endpoints tested put /perimeters/{id}/groups
  Scenario: Update list of perimeter groups
    Given url opfabUrl + 'users/perimeters/'+ perimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group7group8List
    When method put
    Then status 200


  Scenario: Check that groupKarate7 belongs to the perimeter
    Given url opfabUrl + 'users/groups/' + groupKarate7.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id == perimeterKarate4.id
    And match response[0].process == perimeterKarate4.process
    And match response[0].stateRights == perimeterKarate4.stateRights


  Scenario: Check that groupKarate8 belongs to the perimeter
    Given url opfabUrl + 'users/groups/' + groupKarate8.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id == perimeterKarate4.id
    And match response[0].process == perimeterKarate4.process
    And match response[0].stateRights == perimeterKarate4.stateRights


  Scenario: Check that groupKarate9 no longer belongs to the perimeter
    Given url opfabUrl + 'users/groups/' + groupKarate9.id + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.length == 0