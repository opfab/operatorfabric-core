Feature: Add users to a group

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def mygroup = 'groupKarate1'

    # defining users to add
    * def usersArray =
"""
[   "loginkarate1"
]
"""
    * def wrongBodyRequest =
"""
[   {"login" : "loginkarate1"}
]
"""

    #Endpoint tested patch /groups/{id}/users

  Scenario: Add a user to a group with bad request
    Given url opfabUrl + 'users/groups/' + mygroup + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request wrongBodyRequest
    When method patch
    And status 400

  Scenario: Add users to a group without authentication
    Given url opfabUrl + 'users/groups/' + mygroup + '/users'
    And request usersArray
    When method patch
    Then status 401


  Scenario: Add users to a group without an admin user
    Given url opfabUrl + 'users/groups/' + mygroup + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request usersArray
    When method patch
    Then status 403


  Scenario: Add a user to a group that doesn't exist
    Given url opfabUrl + 'users/groups/groupNotExisting/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method patch
    And status 404


  Scenario: Add users to a group
    Given url opfabUrl + 'users/groups/' + mygroup + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method patch
    And status 200