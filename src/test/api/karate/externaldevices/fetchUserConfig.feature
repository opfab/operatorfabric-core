Feature: User Configuration Management (Fetch)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def userConfigEndpoint = 'externaldevices/configurations/users'

  Scenario: Fetch all userConfigurations

    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == '#array'

  Scenario: Fetch existing userConfiguration

    Given url opfabUrl + userConfigEndpoint + '/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response == { userLogin: 'operator1_fr', externalDeviceIds: ['CDS_1']}

  Scenario: Attempt to fetch userConfiguration that doesn't exist

    Given url opfabUrl + userConfigEndpoint + '/user_that_doesnt_exist'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Fetch userConfigurations without authentication

    Given url opfabUrl + userConfigEndpoint
    When method GET
    Then status 401

  Scenario: Fetch userConfigurations without admin role

    Given url opfabUrl + userConfigEndpoint
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403

  Scenario: Fetch a userConfiguration without authentication

    Given url opfabUrl + userConfigEndpoint + '/operator1_fr'
    When method GET
    Then status 401

  Scenario: Fetch a userConfiguration without admin role

    Given url opfabUrl + userConfigEndpoint + '/operator1_fr'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200


