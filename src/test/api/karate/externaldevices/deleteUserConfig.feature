Feature: User Configuration Management (Delete)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def userConfigEndpoint = 'externaldevices/configurations/users'

  Scenario: Delete existing userConfiguration

    Given url opfabUrl + userConfigEndpoint + "/operator2"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Attempt to delete userConfiguration that doesn't exist

    Given url opfabUrl + userConfigEndpoint + "/user_that_doesnt_exist"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404

  Scenario: Delete userConfiguration without authentication

    Given url opfabUrl + userConfigEndpoint + "/operator2"
    When method delete
    Then status 401

  Scenario: Delete userConfiguration without admin role

    Given url opfabUrl + userConfigEndpoint + "/operator2"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


