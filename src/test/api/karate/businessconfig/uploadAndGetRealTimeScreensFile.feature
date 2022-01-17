Feature: uploadRealTimeScreens

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Check that realtime screens configuration does not exist
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.realTimeScreens.length == 0


  Scenario: Post realtime screens configuration file without authentication
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And multipart file file = { read: 'resources/realtimescreens1.json' }
    When method post
    And status 401


  Scenario: Post realtime screens configuration file without admin role
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = { read: 'resources/realtimescreens1.json' }
    When method post
    And status 403


  Scenario: Post realtime screens configuration file
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/realtimescreens1.json' }
    When method post
    And status 201


  Scenario: Check that realtime screens configuration has been created
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.realTimeScreens.length == 1
    Then match response.realTimeScreens[0].screenName == 'All Control Centers'
    Then assert response.realTimeScreens[0].screenColumns.length == 2
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups.length == 3
    Then match response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].name == 'French Control Centers'
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].entities.length == 4
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].groups.length == 2


  Scenario: Post a new realtime screens configuration file
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/realtimescreens2.json' }
    When method post
    And status 201


  Scenario: Check that the new realtime screens configuration has overwritten the previous one
    Given url opfabUrl + '/businessconfig/realtimescreens'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.realTimeScreens.length == 1
    Then match response.realTimeScreens[0].screenName == 'All Control Centers'
    Then assert response.realTimeScreens[0].screenColumns.length == 2
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups.length == 1
    Then match response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].name == 'Central Supervision Centers'
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].entities.length == 1
    Then assert response.realTimeScreens[0].screenColumns[0].entitiesGroups[0].groups.length == 1


  Scenario: Get realtime screens configuration without authentication
    Given url opfabUrl + '/businessconfig/realtimescreens'
    When method GET
    Then status 401