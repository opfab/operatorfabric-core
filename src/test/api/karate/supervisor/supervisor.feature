Feature: Supervisor


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

  

Scenario: start/stop/status API 

    # Call API as non admin user should fail
    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2108/stop'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2108/start'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    # Call API as admin user

    # service status is not active at startup
    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) == 'false'

    Given url 'http://localhost:2108/start'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'Start supervisor'

    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'true'


    Given url 'http://localhost:2108/stop'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) == 'Stop supervisor'


    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) ==  'false'

  
