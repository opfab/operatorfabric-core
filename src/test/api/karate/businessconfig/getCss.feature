Feature: get stylesheet

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def process = 'api_test'
    * def cssName = 'style'
    * def version = 2
    * def templateLanguage = 'en'

Scenario:Check stylesheet

    Given url opfabUrl + '/businessconfig/processes/' + process + '/css/' + cssName + '?version=' + version
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response contains 'color:#ff0000;'

  Scenario:Check stylesheet without authentication

    Given url opfabUrl + '/businessconfig/processes/' + process + '/css/' + cssName + '?version=' + version
    When method GET
    Then status 200

  Scenario:Check stylesheet with normal user

    Given url opfabUrl + '/businessconfig/processes/' + process + '/css/' + cssName + '?version=' + version
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200

  Scenario: Check stylesheet for an nonexisting css version

    Given url opfabUrl + '/businessconfig/processes/' + process + '/css/' + cssName + '?version=9999999999'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Check stylesheet for an nonexisting businessconfig

   Given url opfabUrl + '/businessconfig/processes/unknownBusinessconfig/css/style?version=2'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404
