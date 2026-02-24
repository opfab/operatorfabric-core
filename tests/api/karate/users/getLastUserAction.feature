Feature: Get last user action
  Background:
    #Getting token for admin, supervisor and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsSupervisor = callonce read('../common/getToken.feature') { username: 'itsupervisor1'}
    * def authTokenAsSupervisor = signInAsSupervisor.authToken


  Scenario: Get all user last action as admin
    Given url opfabUrl + 'users/lastUserAction'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response == '#[]'

Scenario: Get all user last action older than 1 day as admin 
    Given url opfabUrl + 'users/lastUserAction/olderThan/1'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response == '#[]'

  Scenario: get card subscription
    Given url opfabUrl + 'cards-consultation/cardSubscription' +'?clientId=ghi0123456789jkl'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response == ''

  Scenario: Get operator1_fr last action
    Given url opfabUrl + 'users/lastUserAction/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response == {"login": 'operator1_fr', lastActionDate: '#notnull'}

  Scenario: Get last user action as supervisor with VIEW_ACTION_LOGS permission
    Given url opfabUrl + 'users/lastUserAction'
    And header Authorization = 'Bearer ' + authTokenAsSupervisor
    When method get
    Then status 200

  Scenario: Get last user action without authentication
    Given url opfabUrl + 'users/lastUserAction'
    When method get
    Then status 401

  Scenario: Get last user action as simple user
    Given url opfabUrl + 'users/lastUserAction'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403
    
  Scenario: Get last user action older than one day as simple user
    Given url opfabUrl + 'users/lastUserAction/olderThan/1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

