Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle

    # Push bundle
    Given url opfabUrl + 'businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_test_action.tar.gz', contentType: 'application/gzip'}

    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'businessconfig/processes/test_action'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'test_action'

