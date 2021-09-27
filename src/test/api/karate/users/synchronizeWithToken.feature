Feature: Synchronize JWT with database

  Background:
    #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'user_test_jwt'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: delete test user 
    Given url opfabUrl + 'users/users/user_test_jwt'
    And header Authorization = 'Bearer ' + authToken
    When method delete

  Scenario: fetch not existing user
    Given url opfabUrl + 'users/users/user_test_jwt'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404

  Scenario: Synchronize user_test_jwt user
    #expected response 201
    Given url opfabUrl + 'users/users/synchronizeWithToken'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 200
    And match response.login == 'user_test_jwt'


  Scenario: check created user
    Given url opfabUrl + 'users/users/user_test_jwt'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200

  Scenario: Synchronize existing user_test_jwt user
    #expected response 200
    Given url opfabUrl + 'users/users/synchronizeWithToken'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method post
    Then status 200
    And match response.login == 'user_test_jwt'

  Scenario: Call without authentication
    #authentication required, expected response 401
    Given url opfabUrl + 'users/users/synchronizeWithToken'
    When method post
    Then status 401

  Scenario: delete user
    Given url opfabUrl + 'users/users/user_test_jwt'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200