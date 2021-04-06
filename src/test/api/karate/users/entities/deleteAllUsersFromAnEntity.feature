Feature: Delete all users from an entity

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def entityDeletedFrom = 'entityKarate1'


  Scenario: delete all users from an entity without authentication
    # Delete all users entity without authentication, expected  response 401
    Given url opfabUrl + 'users/entities/' + entityDeletedFrom + '/users'
    When method delete
    Then status 401

  Scenario: delete all users from an entity without being admin
    # Using TSO user , expected  response 403
    Given url opfabUrl + 'users/entities/' + entityDeletedFrom + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

  Scenario: delete all users from a nonexistent entity
    # Delete all users entity from an unknown entity
    Given url opfabUrl + 'users/entities/unknownentity/users'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  Scenario: delete all users from an entity
    Given url opfabUrl + 'users/entities/' + entityDeletedFrom + '/users'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200