Feature: Device Configuration Management (Create)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def deviceConfigEndpoint = 'externaldevices/configurations/devices'

  Scenario: Create deviceConfiguration with correct configuration

  * def configuration = read("resources/deviceConfigurations/CDS_5.json")

    # Push configuration
    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 201

  Scenario: Create deviceConfiguration with correct configuration but duplicate id

    * def configuration = read("resources/deviceConfigurations/duplicate_CDS_5.json")

    # Push configuration
    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create deviceConfiguration with incorrect configuration

  * def configuration = read("resources/deviceConfigurations/broken_config.json")

    # Push configuration
    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create deviceConfiguration without authentication

  * def configuration = read("resources/deviceConfigurations/CDS_5.json")

    # Push configuration
    Given url opfabUrl + deviceConfigEndpoint
    And request configuration
    When method post
    Then status 401

  Scenario: Create deviceConfiguration without admin role

  * def configuration = read("resources/deviceConfigurations/CDS_5.json")

    # Push configuration
    Given url opfabUrl + deviceConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request configuration
    When method post
    Then status 403


