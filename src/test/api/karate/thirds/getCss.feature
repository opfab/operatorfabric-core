Feature: get stylesheet

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

    * def thirdName = 'api_test'
    * def cssName = 'style'
    * def thirdVersion = 2
    * def templateLanguage = 'en'

Scenario:Check stylesheet

    Given url opfabUrl + 'thirds/' + thirdName + '/css/' + cssName + '?version=' + thirdVersion
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response contains 'color:#ff0000;'

  Scenario:Check stylesheet without authentication

    Given url opfabUrl + 'thirds/' + thirdName + '/css/' + cssName + '?version=' + thirdVersion
    When method GET
    Then status 200

  Scenario:Check stylesheet with normal user

    Given url opfabUrl + 'thirds/' + thirdName + '/css/' + cssName + '?version=' + thirdVersion
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200

  Scenario: Check stylesheet for an nonexisting css version

    Given url opfabUrl + 'thirds/' + thirdName + '/css/' + cssName + '?version=9999999999'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then print response
    And status 404

  Scenario: Check stylesheet for an nonexisting third

   Given url opfabUrl + 'thirds/unknownThird/css/style?version=2'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then print response
    And status 404