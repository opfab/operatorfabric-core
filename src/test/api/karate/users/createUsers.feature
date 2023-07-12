Feature: CreateUsers

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

        # defining users to create
    * def userKarate =
"""
{
   "login" : "loginkarate1",
   "firstName" : "name",
   "lastName" : "familyName",
   "comment" : "comment"
}
"""

    * def userUpdate =
"""
{
   "login" : "loginkarate1",
   "firstName" : "nameUpdate",
   "lastName" : "familyNameUpdate"
}
"""

  * def adminUser =
"""
  {

     "login" : "admin",
     "groups": []
  }
  """

    * def wrongUser =
"""
{
   "random" : "login"
}
"""

    * def userToTestBadRequest0 =
"""
{
   "login" : "",
   "firstName" : "first name",
   "lastName" : "last name"
}
"""

    * def userWithValidLoginFormat0 =
"""
{
   "login" : "validLoginConvertedToLowercaseLetters",
   "firstName" : "first name",
   "lastName" : "last name"
}
"""


    * def userWithValidLoginFormat1 =
"""
{
   "login" : "valid_login",
   "firstName" : "first name",
   "lastName" : "last name"
}
"""

    * def userWithValidLoginFormat2 =
"""
{
   "login" : "valid-login",
   "firstName" : "first name",
   "lastName" : "last name"
}
"""

    * def userWithValidLoginFormat3 =
"""
{
   "login" : "valid.login",
   "firstName" : "first name",
   "lastName" : "last name"
}
"""

    * def userWithValidLoginFormat4 =
"""
{
   "login" : "valid.login_with-digit_0",
   "firstName" : "first name",
   "lastName" : "last name"
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
    And match response.comment == userKarate.comment

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

  Scenario: create a user with a normal account
   #authenticated as TSO, expected response 403
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userKarate
    When method post
    Then status 403

  Scenario: Try to remove the admin user from the ADMIN group
    #post /users
    #update user, expected response 403
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request adminUser
    When method post
    Then status 400
    And match response.message == 'Removing group ADMIN from user admin is not allowed'

  Scenario: bad request
   #expected response 400
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request wrongUser
    When method post
    Then status 400


  Scenario Outline: bad request
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request <userToTestBadRequest>
    When method post
    Then status 400
    And match response.status == "BAD_REQUEST"
    And match response.message == <expectedMessage>

    Examples:
      | userToTestBadRequest  | expectedMessage                                                                                                                            |
      | userToTestBadRequest0 | "Mandatory 'login' field is missing."                                                                                                      |


  Scenario Outline: request successful
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request <userWithValidLoginFormat>
    When method post
    Then status 201
    And match response.login == <expectedLogin>

    Examples:
      | userWithValidLoginFormat  | expectedLogin                                     |
      | userWithValidLoginFormat0 | karate.lowerCase(userWithValidLoginFormat0.login) |
      | userWithValidLoginFormat1 | userWithValidLoginFormat1.login                   |
      | userWithValidLoginFormat2 | userWithValidLoginFormat2.login                   |
      | userWithValidLoginFormat3 | userWithValidLoginFormat3.login                   |
      | userWithValidLoginFormat4 | userWithValidLoginFormat4.login                   |


  Scenario Outline: we delete the users previously created
    Given url opfabUrl + 'users/users/' + <login>
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Examples:
      | login  |
      | karate.lowerCase(userWithValidLoginFormat0.login) |
      | userWithValidLoginFormat1.login |
      | userWithValidLoginFormat2.login |
      | userWithValidLoginFormat3.login |
      | userWithValidLoginFormat4.login |
