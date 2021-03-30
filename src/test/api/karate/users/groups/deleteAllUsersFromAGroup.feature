Feature: Delete all users from a group

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def groupDeletedFrom = 'groupKarate1'


  Scenario: delete all users from a group without authentication
    # Delete all users group without authentication, expected  response 401
    Given url opfabUrl + 'users/groups/' + groupDeletedFrom + '/users'
    When method delete
    Then status 401

  Scenario: delete all users from a group without being admin
    # Using TSO user , expected  response 403
    Given url opfabUrl + 'users/groups/' + groupDeletedFrom + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

  Scenario: delete all users from a nonexistent group
    # Delete all users group from an unknown group
    Given url opfabUrl + 'users/groups/unknowngroup/users'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  Scenario: delete all users from a group
    #delete /groups/{name}/users
    # Delete all users group, expected  response 200
    Given url opfabUrl + 'users/groups/' + groupDeletedFrom + '/users'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200