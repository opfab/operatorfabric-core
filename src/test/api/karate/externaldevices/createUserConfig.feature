Feature: User Configuration Management (Create)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def userConfigEndpoint = 'externaldevices/configurations/users'

  Scenario: Create userConfiguration with correct configuration

  * def configuration = read("resources/userConfigurations/operator5.json")

    # Push configuration
    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 201

  Scenario: Create userConfiguration with correct configuration but duplicate id

    * def configuration = read("resources/userConfigurations/duplicate_operator1.json")

    # Push configuration
    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create userConfiguration with incorrect configuration

  * def configuration = read("resources/userConfigurations/broken_config.json")

    # Push configuration
    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create userConfiguration without authentication

  * def configuration = read("resources/userConfigurations/operator5.json")

    # Push configuration
    Given url opfabUrl + userConfigEndpoint
    And request configuration
    When method post
    Then status 401

  Scenario: Create userConfiguration without admin role

  * def configuration = read("resources/userConfigurations/operator5.json")

    # Push configuration
    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request configuration
    When method post
    Then status 403


