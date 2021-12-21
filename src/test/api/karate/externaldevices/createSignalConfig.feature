Feature: Signal Configuration Management (Create)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def signalConfigEndpoint = 'externaldevices/configurations/signals'

  Scenario: Create signalMapping with correct configuration

  * def configuration = read("resources/signalMappings/new_signal_mapping.json")

    # Push configuration
    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 201

  Scenario: Create signalMapping with correct configuration but duplicate id

    * def configuration = read("resources/signalMappings/duplicate_signal_mapping.json")

    # Push configuration
    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create signalMapping with incorrect configuration

  * def configuration = read("resources/signalMappings/broken_signal_mapping.json")

    # Push configuration
    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    And request configuration
    When method post
    Then status 400

  Scenario: Create signalMapping without authentication

  * def configuration = read("resources/signalMappings/new_signal_mapping.json")

    # Push configuration
    Given url opfabUrl + signalConfigEndpoint
    And request configuration
    When method post
    Then status 401

  Scenario: Create signalMapping without admin role

  * def configuration = read("resources/signalMappings/new_signal_mapping.json")

    # Push configuration
    Given url opfabUrl + signalConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request configuration
    When method post
    Then status 403


