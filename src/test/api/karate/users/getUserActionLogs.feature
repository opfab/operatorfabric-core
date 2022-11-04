Feature: Get user action logs
  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Get user actions logs as admin
    # get all users actions as admin
    Given url opfabUrl + 'users/userActionLogs'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200



  Scenario: Get user actions log without authentication
    # Without authentication, response expected 401
    Given url opfabUrl + 'users/userActionLogs'
    When method get
    Then status 401




  Scenario: Get user actions log as simple user
    Given url opfabUrl + 'users/userActionLogs'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

