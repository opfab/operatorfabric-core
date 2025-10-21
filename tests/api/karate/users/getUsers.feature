Feature: Add users to a group

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Get Users
    # get all users
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].login != null
    And def login = response[0].login


  Scenario: Get Users without authentication
    # Without authentication, response expected 401
    Given url opfabUrl + 'users/users'
    When method get
    Then status 401

  Scenario: with simple user
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200

