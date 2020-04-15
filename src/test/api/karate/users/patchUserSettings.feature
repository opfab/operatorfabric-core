Feature: patch user settings

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
   # * def signInAsUser = call read('getToken.feature') { username: 'user'}
   # * def authTokenAsUser = signInAsUser.authToken


    * def userSettings =
"""
{
  "login" : "loginKarate1",
  "email" : "user@user.com",
  "description" : "my dummy user",
  "timeZone" : "Europe/Dublin",
  "locale" : "en",
  "timeFormat" : "LT",
  "dateFormat" : "L",
  "defaultTags" : [ "tag 1", "tag 2" ]
}
"""

    * def userSettingsTSO1 =
"""
{
  "login" : "tso1-operator",
  "email" : "tso1-operator@user.com",
  "description" : "my dummy tso1-operator user",
  "timeZone" : "Australia/Melbourne",
  "locale" : "en",
  "timeFormat" : "LT",
  "dateFormat" : "L",
  "defaultTags" : [ "tag 3", "tag 4" ]
}
"""

    * def nonexistentUserSettings =
"""
{
  "login" : "nonexistentUser",
  "email" : "nonexistentUser@user.com",
  "description" : "my dummy nonexistentUser user",
  "timeZone" : "France/Paris",
  "locale" : "fr",
  "timeFormat" : "LT",
  "dateFormat" : "L",
  "defaultTags" : [ "tag 5", "tag 6" ]
}
"""


  Scenario: Patch user settings without authentication

    Given url opfabUrl + 'users/users/' + userSettings.login + '/settings'
    And request userSettings
    When method patch
    Then status 401


  Scenario: Patch user settings with an authorized user

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
    Then print response
    And status 200
    And match response.login == userSettings.login
    And match response.email == userSettings.email
    And match response.description == userSettings.description
    And match response.timeZone == userSettings.timeZone
    And match response.locale == userSettings.locale
    And match response.timeFormat == userSettings.timeFormat
    And match response.dateFormat == userSettings.dateFormat
    And match response.defaultTags == userSettings.defaultTags


  Scenario: Patch tso1-operator user settings with tso1-operator authentication

    Given url opfabUrl + 'users/users/tso1-operator/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userSettingsTSO1
    When method patch
    Then print response
    And status 200
    And match response.login == userSettingsTSO1.login
    And match response.email == userSettingsTSO1.email
    And match response.description == userSettingsTSO1.description
    And match response.timeZone == userSettingsTSO1.timeZone
    And match response.locale == userSettingsTSO1.locale
    And match response.timeFormat == userSettingsTSO1.timeFormat
    And match response.dateFormat == userSettingsTSO1.dateFormat
    And match response.defaultTags == userSettingsTSO1.defaultTags


  #404 : return status not reproducible with karate
 #Scenario: Patch an nonexistent user

  #Given url opfabUrl + 'users/users/' + nonexistentUserSettings.login + '/settings'
    #And header Authorization = 'Bearer ' + authToken
    #And request nonexistentUserSettings
    #When method patch
    #Then status 404