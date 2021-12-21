Feature: Signal Configuration Management (Fetch)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def signalConfigEndpoint = 'externaldevices/configurations/signals'

  Scenario: Fetch all signalMappings

    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == '#array'

  Scenario: Fetch existing signalMapping

    Given url opfabUrl + signalConfigEndpoint + '/default_CDS_mapping'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == {id:"default_CDS_mapping", supportedSignals:{ALARM:1,ACTION:2,COMPLIANT:3,INFORMATION:4}}

  Scenario: Attempt to fetch signalMapping that doesn't exist

    Given url opfabUrl + signalConfigEndpoint + '/mapping_that_doesnt_exist'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Fetch signalMappings without authentication

    Given url opfabUrl + signalConfigEndpoint
    When method GET
    Then status 401

  Scenario: Fetch signalMappings without admin role

    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403

  Scenario: Fetch a signalMapping without authentication

    Given url opfabUrl + signalConfigEndpoint + '/default_CDS_mapping'
    When method GET
    Then status 401

  Scenario: Fetch a signalMapping without admin role

    Given url opfabUrl + signalConfigEndpoint + '/default_CDS_mapping'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403


