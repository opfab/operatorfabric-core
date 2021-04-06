Feature: Delete all groups from a perimeter (endpoint tested : DELETE /perimeters/{id}/groups)

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def perimeterDeletedFrom = 'perimeterKarate1_1'


  Scenario: delete all groups from a perimeter without authentication
    # Delete all groups from a perimeter without authentication, expected  response 401
    Given url opfabUrl + 'users/perimeters/' + perimeterDeletedFrom + '/groups'
    When method delete
    Then status 401

  Scenario: delete all groups from a perimeter without being admin
    # Using TSO user , expected  response 403
    Given url opfabUrl + 'users/perimeters/' + perimeterDeletedFrom + '/groups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

  Scenario: delete all groups from a nonexistent perimeter
    # Delete all groups from an unknown perimeter
    Given url opfabUrl + 'users/perimeters/unknownperimeter/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404
    And match response.status == 'NOT_FOUND'
    And match response.message == 'Perimeter unknownperimeter not found'


  Scenario: delete all groups from a perimeter
    #delete /perimeters/{id}/groups
    # Delete all groups from a perimeter, expected  response 200
    Given url opfabUrl + 'users/perimeters/' + perimeterDeletedFrom + '/groups'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200