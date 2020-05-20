Feature: delete group from a perimeter (endpoint tested : DELETE /perimeters/{idPerimeter}/groups/{idGroup})

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


   #defining perimeters
    * def perimeterKarate2_1 =
"""
{
  "id" : "perimeterKarate2_1",
  "process" : "process2",
  "stateRights" : [
    {
      "state" : "state1",
      "right" : "ReadAndWrite"
    }
  ]
}
"""

    # defining groups to create
    * def groupKarate2 =
"""
{
   "id" : "groupKarate2",
   "name" : "groupKarate2 name",
   "description" : "groupKarate2 description"
}
"""

    * def groupsArray =
"""
[   "groupKarate2"
]
"""

  # First, create the perimeter
  Scenario: create the perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterKarate2_1
    When method post
    Then status 201
    And match response.id == perimeterKarate2_1.id
    And match response.process == perimeterKarate2_1.process
    And match response.stateRights == perimeterKarate2_1.stateRights


  Scenario: Create the group (if everything is ok, the group already exists)
    #post /groups
    #create new group, expected response 201
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupKarate2
    When method post
    Then status 200
    And match response.id == groupKarate2.id
    And match response.name == groupKarate2.name
    And match response.description == groupKarate2.description


  Scenario: Affect a group to the perimeter

    Given url opfabUrl + 'users/perimeters/' + perimeterKarate2_1.id +'/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupsArray
    When method put
    Then status 200


  Scenario: Delete group from a perimeter (with tso1-operator authentication)
    #Given url opfabUrl + 'users/perimeters/' + perimeterDeletedFrom + '/groups/' + groupToDelete
    Given url opfabUrl + 'users/perimeters/' + perimeterKarate2_1.id  + '/groups/' + groupKarate2.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: No authentication, expected response 401
    Given url opfabUrl + 'users/perimeters/' + perimeterKarate2_1.id  + '/groups/' + groupKarate2.id
    When method delete
    Then status 401


  Scenario: Delete group from a non-existent perimeter
  #  non-existent perimeter, expected response 404
    Given url opfabUrl + 'users/perimeters/' + 'perimeterNonExistent'  + '/groups/' + groupKarate2.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Perimeter perimeterNonExistent not found'


  #delete /perimeters/{idPerimeter}/groups/{idGroup}
  Scenario: Delete group from a perimeter (with admin authentication)
    Given url opfabUrl + 'users/perimeters/' + perimeterKarate2_1.id  + '/groups/' + groupKarate2.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200