Feature: patch user settings

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken
   # * def signInAsUser = callonce read('getToken.feature') { username: 'user'}
   # * def authTokenAsUser = signInAsUser.authToken


    * def userSettings =
"""
{
  "login" : "loginKarate1",
  "description" : "my dummy user",
  "timeZone" : "Europe/Dublin",
  "locale" : "en",
  "processesStatesNotNotified": {"processA": ["state1", "state2"], "processB": ["state3", "state4"]}
}
"""

    * def userSettingsDispatcher =
"""
{
  "login" : "operator1",
  "description" : "my dummy operator1 user",
  "timeZone" : "Australia/Melbourne",
  "locale" : "en",
  "processesStatesNotNotified": {"processC": ["state5", "state6"], "processD": ["state7", "state8"]}
}
"""

    * def nonexistentUserSettings =
"""
{
  "login" : "nonexistentUser",
  "description" : "my dummy nonexistentUser user",
  "timeZone" : "France/Paris",
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
    # patch /users/{login}/settings

    Given url opfabUrl + 'users/users/' + userSettings.login + '/settings'
    And header Authorization = 'Bearer ' + authToken
    And request userSettings
    When method patch
    Then status 200
    And match response.login == userSettings.login
    And match response.description == userSettings.description
    And match response.timeZone == userSettings.timeZone
    And match response.locale == userSettings.locale
    And match response.processesStatesNotNotified == userSettings.processesStatesNotNotified


  Scenario: Patch operator1 user settings with operator1 authentication

    Given url opfabUrl + 'users/users/operator1/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userSettingsDispatcher
    When method patch
    Then status 200
    And match response.login == userSettingsDispatcher.login
    And match response.description == userSettingsDispatcher.description
    And match response.timeZone == userSettingsDispatcher.timeZone
    And match response.locale == userSettingsDispatcher.locale
    And match response.processesStatesNotNotified == userSettingsDispatcher.processesStatesNotNotified


  #404 : return status not reproducible with karate
 #Scenario: Patch an nonexistent user

  #Given url opfabUrl + 'users/users/' + nonexistentUserSettings.login + '/settings'
    #And header Authorization = 'Bearer ' + authToken
    #And request nonexistentUserSettings
    #When method patch
    #Then status 404