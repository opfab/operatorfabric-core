Feature: Device Configuration Management (Delete)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def deviceConfigEndpoint = 'externaldevices/configurations/devices'

  Scenario: Delete existing deviceConfiguration

    Given url opfabUrl + deviceConfigEndpoint + "/CDS_3"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Attempt to delete deviceConfiguration that doesn't exist

    Given url opfabUrl + deviceConfigEndpoint + "/CDS_that_doesnt_exist"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404

  Scenario: Delete deviceConfiguration without authentication

    Given url opfabUrl + deviceConfigEndpoint + "/CDS_3"
    When method delete
    Then status 401

  Scenario: Delete deviceConfiguration without admin role

    Given url opfabUrl + deviceConfigEndpoint + "/CDS_3"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


