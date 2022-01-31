Feature: getI18n

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def process = 'api_test'
    * def templateName = 'template'
    * def businessconfigVersion = 2
    * def fileLanguage = 'en'


##########################################
## Test i18n.json translation file ###
  Scenario: Check i18n translation file

    # Check template
    Given url opfabUrl + '/businessconfig/processes/'+ process +'/i18n/' + '?version='+ businessconfigVersion
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200

  Scenario: Check i18n translation file without authentication

    Given url opfabUrl + '/businessconfig/processes/'+ process +'/i18n/' + '?version='+ businessconfigVersion
    When method GET
    Then status 401

  Scenario: Check unknown i18n translation file version

    Given url opfabUrl + '/businessconfig/processes/'+ process +'/i18n/' + '?version=9999999'
    And header Authorization = 'Bearer ' + authToken
    When method GET
   Then status 404



  Scenario: Check i18n translation for an unknown businessconfig

    Given url opfabUrl + '/businessconfig/processes/unknownBusinessconfig/i18n/' + '?version='+ businessconfigVersion
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then  status 404