Feature: deleteUser

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


    # defining user to create
    * def user_for_endpoint_delete_user =
"""
{
   "login" : "user_for_endpoint_delete_user",
   "firstName" : "user_for_endpoint_delete_user firstname",
   "lastName" : "user_for_endpoint_delete_user lastname"
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
    And request user_for_endpoint_delete_user
    When method post
    Then status 201
    And match response.login == user_for_endpoint_delete_user.login
    And match response.firstName == user_for_endpoint_delete_user.firstName
    And match response.lastName == user_for_endpoint_delete_user.lastName


  Scenario: we check that the user created previously exists
    Given url opfabUrl + 'users/users/' + user_for_endpoint_delete_user.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: delete user with no authentication, expected response 401
    Given url opfabUrl + 'users/users/' + user_for_endpoint_delete_user.login
    When method delete
    Then status 401


  Scenario: delete user with no admin authentication (with operator1_fr authentication), expected response 403
    Given url opfabUrl + 'users/users/' + user_for_endpoint_delete_user.login
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete oneself, expected response 403
    Given url opfabUrl + 'users/users/admin'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 403


  Scenario: delete user (with admin authentication), expected response 200
    Given url opfabUrl + 'users/users/' + user_for_endpoint_delete_user.login
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: we check that the user doesn't exist anymore, expected response 404
    Given url opfabUrl + 'users/users/' + user_for_endpoint_delete_user.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404