Feature: Cards reminder service


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

Scenario: healthcheck API 

    # Call healthcheck API without authentication
    Given url 'http://localhost:2107/healthcheck'
    When method get
    Then status 200

Scenario: start/stop/status API 

    # Call API as non admin user should fail
    Given url 'http://localhost:2107/status'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2107/stop'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2107/start'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    # Call API as admin user
    Given url 'http://localhost:2107/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) == 'true'

    Given url 'http://localhost:2107/stop'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) == 'Stop service'

    Given url 'http://localhost:2107/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'false'

    # Call API as admin user
    Given url 'http://localhost:2107/start'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'Start service'

    Given url 'http://localhost:2107/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) ==  'true'

  
