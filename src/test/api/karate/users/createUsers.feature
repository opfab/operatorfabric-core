Feature: CreateUsers

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

        # defining users to create
    * def userKarate =
"""
{

   "login" : "loginKarate1",
   "firstName" : "name",
   "lastName" : "familyName"
}
"""

    * def userUpdate =
"""
{

   "login" : "loginKarate1",
   "firstName" : "nameUpdate",
   "lastName" : "familyNameUpdate"
}
"""

    * def wrongUser =
"""
{

   "random" : "login"
}
"""

  Scenario: Create users
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate
    When method post
    Then status 201
    And match response.login == userKarate.login
    And match response.firstName == userKarate.firstName
    And match response.lastName == userKarate.lastName

  Scenario: Update users
    #post /users
    #update user, expected response 200
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userUpdate
    When method post
    Then status 200
    And match response.login == userUpdate.login
    And match response.firstName == userUpdate.firstName
    And match response.lastName == userUpdate.lastName

  Scenario: Create user without authentication
      #authentication required, expected response 401
    Given url opfabUrl + 'users/users'
    And request userKarate
    When method post
    Then status 401
    And print response

  Scenario: create a user with a normal account
   #authenticated as TSO, expected response 403
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userKarate
    When method post
    Then status 403

   Scenario: bad request
        #expected response 400
    Given url opfabUrl + 'users/users'
   And header Authorization = 'Bearer ' + authToken
   And request wrongUser
    When method post
    Then status 400