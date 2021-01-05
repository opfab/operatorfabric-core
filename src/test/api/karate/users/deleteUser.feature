Feature: deleteUser

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    # defining user to create
    * def userForEndpointDeleteUser =
"""
{
   "login" : "userForEndpointDeleteUser",
   "firstName" : "userForEndpointDeleteUser firstname",
   "lastName" : "userForEndpointDeleteUser lastname"
}
"""


  Scenario: Delete user for a non-existent user, expected response 404
    Given url opfabUrl + 'users/users/nonexistentuser'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  # then we create a new user who will be deleted
  Scenario: create a new user
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userForEndpointDeleteUser
    When method post
    Then status 201
    And match response.login == karate.lowerCase(userForEndpointDeleteUser.login)
    And match response.firstName == userForEndpointDeleteUser.firstName
    And match response.lastName == userForEndpointDeleteUser.lastName


  Scenario: we check that the user created previously exists
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userForEndpointDeleteUser.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: delete user with no authentication, expected response 401
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userForEndpointDeleteUser.login)
    When method delete
    Then status 401


  Scenario: delete user with no admin authentication (with operator1 authentication), expected response 403
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userForEndpointDeleteUser.login)
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete oneself, expected response 403
    Given url opfabUrl + 'users/users/admin'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 403


  Scenario: delete user (with admin authentication), expected response 200
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userForEndpointDeleteUser.login)
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: we check that the user doesn't exist anymore, expected response 404
    Given url opfabUrl + 'users/users/' + karate.lowerCase(userForEndpointDeleteUser.login)
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404