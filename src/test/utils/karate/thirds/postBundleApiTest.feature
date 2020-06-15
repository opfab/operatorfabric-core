Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle

    # Push bundle
    Given url opfabUrl + 'thirds'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundle_api_test.tar.gz')
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.name == 'api_test'

