Feature: uploadProcessMonitoringConfiguration

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post process monitoring configuration file without authentication
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And multipart file file = { read: 'resources/processMonitoring1.json' }
    When method post
    And status 401


  Scenario: Post process monitoring configuration file without admin role
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = { read: 'resources/processMonitoring1.json' }
    When method post
    And status 403


  Scenario: Post process monitoring configuration file
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processMonitoring1.json' }
    When method post
    And status 201


  Scenario: Check that process monitoring configuration has been created
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.fields.length == 2
    Then match response.fields[0].field == 'startDate'
    Then match response.fields[0].type == 'date'
    Then match response.fields[0].colName == 'Start Date'
    Then match response.fields[0].size == 200
    Then match response.fields[1].field == 'data.stateName'
    Then match response.fields[1].colName == 'My field'
    Then match response.fields[1].size == 300


  Scenario: Post a new process monitoring configuration file
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processMonitoring2.json' }
    When method post
    And status 201


  Scenario: Check that the new process monitoring configuration has overwritten the previous one
    Given url opfabUrl + '/businessconfig/processmonitoring'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.fields.length == 1
    Then match response.fields[0].field == 'titleTranslated'
    Then match response.fields[0].colName == 'Title'
    Then match response.fields[0].size == 250


  Scenario: Get process monitoring configuration without authentication
    Given url opfabUrl + '/businessconfig/processmonitoring'
    When method GET
    Then status 401
