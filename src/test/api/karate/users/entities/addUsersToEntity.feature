Feature: Add users to an entity

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def myentity = 'entityKarate1'

    # defining users to add
    * def usersArray =
"""
[   "loginKarate1"
]
"""
    * def wrongBodyRequest =
"""
[   {"login" : "loginKarate1"}
]
"""

    #Endpoint tested patch /entities/{id}/users

  Scenario: Add a user to an entity with bad request
    Given url opfabUrl + 'users/entities/' + myentity + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request wrongBodyRequest
    When method patch
    And status 400

  Scenario: Add users to an entity without authentication
    Given url opfabUrl + 'users/entities/' + myentity + '/users'
    And request usersArray
    When method patch
    Then status 401


  Scenario: Add users to an entity without an admin user
    Given url opfabUrl + 'users/entities/' + myentity + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request usersArray
    When method patch
    Then status 403


  Scenario: Add a user to an entity that doesn't exist
    Given url opfabUrl + 'users/entities/entityNotExisting/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method patch
    And status 404


  Scenario: Add users to an entity
    Given url opfabUrl + 'users/entities/' + myentity + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request usersArray
    When method patch
    And status 200