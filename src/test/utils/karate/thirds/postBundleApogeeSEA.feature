Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle for big cards 

    # Push bundle
    Given url opfabUrl + 'thirds/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundle_api_test_apogee.tar.gz')
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'thirds/processes/APOGEESEA'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'APOGEESEA'

