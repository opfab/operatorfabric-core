Feature: Signal Configuration Management (Delete)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def signalConfigEndpoint = 'externaldevices/configurations/signals'

  Scenario: Delete existing signalMapping

    Given url opfabUrl + signalConfigEndpoint + "/exotic_CDS_mapping"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Attempt to delete signalMapping that doesn't exist

    Given url opfabUrl + signalConfigEndpoint + "/mapping_that_doesnt_exist"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404

  Scenario: Delete signalMapping without authentication

    Given url opfabUrl + signalConfigEndpoint + "/exotic_CDS_mapping"
    When method delete
    Then status 401

  Scenario: Delete signalMapping without admin role

    Given url opfabUrl + signalConfigEndpoint + "/exotic_CDS_mapping"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


