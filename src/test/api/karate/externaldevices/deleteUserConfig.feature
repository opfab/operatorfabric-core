Feature: User Configuration Management (Delete)

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def signInAsTSO2 = callonce read('../common/getToken.feature') { username: 'operator2_fr'}
    * def authTokenAsTSO2 = signInAsTSO2.authToken

    * def userConfigEndpoint = 'externaldevices/configurations/users'

    * def userSettings =
"""
{
  "login" : "loginkarate1",
  "playSoundOnExternalDevice" : true
}
"""

  Scenario: Set playSoundOnExternalDevice on user settings
    Given url opfabUrl + "users/users/operator2_fr/settings"
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    And request userSettings
    When method patch
    Then status 200
    And match response.playSoundOnExternalDevice == true

  Scenario: Delete existing userConfiguration

    Given url opfabUrl + userConfigEndpoint + "/operator2_fr"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200
  
  Scenario: Check playSoundOnExternalDevice on user settings is false
    Given url opfabUrl + "users/users/operator2_fr/settings"
    And header Authorization = 'Bearer ' + authTokenAsTSO2
    When method GET
    Then status 200
    And match response.playSoundOnExternalDevice == false

  Scenario: Attempt to delete userConfiguration that doesn't exist

    Given url opfabUrl + userConfigEndpoint + "/user_that_doesnt_exist"
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404

  Scenario: Delete userConfiguration without authentication

    Given url opfabUrl + userConfigEndpoint + "/operator2_fr"
    When method delete
    Then status 401

  Scenario: Delete userConfiguration without admin role

    Given url opfabUrl + userConfigEndpoint + "/operator2_fr"
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


