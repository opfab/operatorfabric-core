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


  Scenario: Check template and style

    # Check template
    Given url opfabUrl + 'thirds/api_test/templates/template?locale=en&version=1'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response contains '{{card.data.message}}'

    # Check stylesheet
    Given url opfabUrl + 'thirds/api_test/css/style?version=1'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response contains 'color:#ff0000;'


  Scenario: Post Bundle for big cards 

    # Push bundle
    Given url opfabUrl + 'thirds'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundle_api_test_apogee.tar.gz')
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'thirds/APOGEESEA'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.name == 'APOGEESEA'

