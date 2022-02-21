Feature: patch user settings

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
   # * def signInAsUser = callonce read('getToken.feature') { username: 'user'}
   # * def authTokenAsUser = signInAsUser.authToken


    * def userSettings =
"""
{
  "login" : "loginKarate1",
  "description" : "my dummy user",
  "locale" : "en",
  "processesStatesNotNotified": {"processA": ["state1", "state2"], "processB": ["state3", "state4"]},
  "entitiesDisconnected": ["ENTITY_A", "ENTITY_B"],
  "remoteLoggingEnabled" : true
}
"""

    * def userSettingsDispatcher =
"""
{
  "login" : "operator1_fr",
  "description" : "my dummy operator1_fr user",
  "locale" : "en",
  "processesStatesNotNotified": {"processC": ["state5", "state6"], "processD": ["state7", "state8"]},
  "entitiesDisconnected": ["ENTITY_C", "ENTITY_D"],
  "remoteLoggingEnabled" : false
}
"""

    * def nonexistentUserSettings =
"""
{
  "login" : "nonexistentUser",
  "description" : "my dummy nonexistentUser user",
  "locale" : "fr",
  "processesStatesNotNotified": {"processE": ["state9", "state10"], "processF": ["state11", "state12"]}
}
"""


  Scenario: Patch user settings without authentication

    Given url opfabUrl + 'users/users/' + userSettings.login + '/settings'
    And request userSettings
    When method patch
    Then status 401


  Scenario: Patch user settings with an unauthorized user

    Given url opfabUrl + 'users/users/' + userSettings.login + '/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userSettings
    When method patch
    Then status 403


  Scenario: Patch user settings with admin user

    Given url opfabUrl + 'users/users/' + userSettings.login + '/settings'
    And header Authorization = 'Bearer ' + authToken
    And request userSettings
    When method patch
    Then status 200
    And match response.login == userSettings.login
    And match response.description == userSettings.description
    And match response.locale == userSettings.locale
    And match response.processesStatesNotNotified == userSettings.processesStatesNotNotified
    And match response.entitiesDisconnected == userSettings.entitiesDisconnected
    And match response.remoteLoggingEnabled == userSettings.remoteLoggingEnabled


  Scenario: Patch operator1_fr user settings with operator1_fr authentication

    Given url opfabUrl + 'users/users/operator1_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userSettingsDispatcher
    When method patch
    Then status 200
    And match response.login == userSettingsDispatcher.login
    And match response.description == userSettingsDispatcher.description
    And match response.locale == userSettingsDispatcher.locale
    And match response.processesStatesNotNotified == userSettingsDispatcher.processesStatesNotNotified
    And match response.entitiesDisconnected == userSettingsDispatcher.entitiesDisconnected
    And match response.remoteLoggingEnabled == userSettingsDispatcher.remoteLoggingEnabled


