Feature: Add groups to a perimeter (endpoint tested : PATCH /perimeters/{id}/groups)

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def myperimeter = 'perimeterKarate1_1'

    # defining groups to add
    * def groupsArray =
"""
[   "groupKarate1"
]
"""
    * def wrongBodyRequest =
"""
[   {"id" : "groupKarate1"}
]
"""
    * def wrongGroupsArray =
"""
[   "groupKarate1", "groupKarateNotExisting"
]
"""


  Scenario: Add a group to a perimeter with bad request
    Given url opfabUrl + 'users/perimeters/' + myperimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongBodyRequest
    When method patch
    And status 400

  Scenario: Add groups to a perimeter without authentication
    Given url opfabUrl + 'users/perimeters/' + myperimeter + '/groups'
    And request groupsArray
    When method patch
    Then status 401


  Scenario: Add groups to a perimeter without an admin user
    Given url opfabUrl + 'users/perimeters/' + myperimeter + '/groups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request groupsArray
    When method patch
    Then status 403


  Scenario: Add a group to a perimeter that doesn't exist
    Given url opfabUrl + 'users/perimeters/perimeterNotExisting/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupsArray
    When method patch
    And status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Perimeter perimeterNotExisting not found'


  Scenario: Add bad groups list to a perimeter (one group in the list doesn't exist)
    Given url opfabUrl + 'users/perimeters/' + myperimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongGroupsArray
    When method patch
    And status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Bad group list : group groupKarateNotExisting not found'


  Scenario: Add groups to a perimeter
    Given url opfabUrl + 'users/perimeters/' + myperimeter + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupsArray
    When method patch
    And status 200