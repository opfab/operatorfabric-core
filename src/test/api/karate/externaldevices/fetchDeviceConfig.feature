Feature: Device Configuration Management (Fetch)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def deviceConfigEndpoint = 'externaldevices/configurations/devices'

  Scenario: Fetch all deviceConfigurations

    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == '#array'

  Scenario: Fetch existing deviceConfiguration

    Given url opfabUrl + deviceConfigEndpoint + '/CDS_1'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == { id: 'CDS_1', host: 'dummy-modbus-device_1', port: 4030, signalMappingId: 'default_CDS_mapping'}

  Scenario: Attempt to fetch deviceConfiguration that doesn't exist

    Given url opfabUrl + deviceConfigEndpoint + '/device_that_doesnt_exist'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Fetch deviceConfigurations without authentication

    Given url opfabUrl + deviceConfigEndpoint
    When method GET
    Then status 401

  Scenario: Fetch deviceConfigurations without admin role

    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403

  Scenario: Fetch a deviceConfiguration without authentication

    Given url opfabUrl + deviceConfigEndpoint + '/CDS_1'
    When method GET
    Then status 401

  Scenario: Fetch a deviceConfiguration without admin role

    Given url opfabUrl + deviceConfigEndpoint + '/CDS_1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403


