Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: check bundle

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'

  Scenario: check bundle without authentication

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    When method GET
    Then print response
    And status 401
