Feature: deleteBundleVersion

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
   #Using callonce to make the call just once at the beginnig
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
   #The "." in the middle of the following file path is just a trick to force 
   #karate to make a second and final call to getToken.feature
    * def signInAsTSO = callonce read('../common/./getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push a bundle v1
          # Push bundle
      Given url opfabUrl + '/thirds/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart field file = read('resources/bundle_api_test.tar.gz')
      When method post
      Then print response
      And status 201

    Scenario: Push a bundle v2
          # Push bundle
      Given url opfabUrl + '/thirds/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart field file = read('resources/bundle_api_test_v2.tar.gz')
      When method post
      Then print response
      And status 201

  Scenario: Delete a Third Version without authentication
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/1'
    When method DELETE
    Then print response
    And status 401

  Scenario: Delete a Third Version with a authentication having insufficient privileges
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/1'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method DELETE
    Then print response
    And status 403

  Scenario: check bundle default version

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'
    And match response.version == '2'

  Scenario: Delete a Third Version is being the default version
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/2'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

  Scenario: check bundle default version is changed

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'
    And match response.version != '2'
    And print 'new default version for api_test bundle is ', response.version

  Scenario: check bundle version 2 doesn't exist anymore

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test/2'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404    

  Scenario: Push a bundle v2
          # Push bundle
      Given url opfabUrl + '/thirds/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart field file = read('resources/bundle_api_test_v2.tar.gz')
      When method post
      Then print response
      And status 201

  Scenario: check bundle default version is not 1

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'
    And match response.version != '1'
    And print 'New default version for api_test bundle is ', response.version

Scenario: Delete a Third Version is not being the default version
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/1'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

  Scenario: check bundle default version is not 1

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'
    And match response.version != '1'

  Scenario: check bundle version 1 doesn't exist anymore

    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test/1'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404    

  Scenario: Delete a not existing Third version
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/3'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 404
    And print response

Scenario: Delete a Third Version is being also the only one hold in the bundle
    # Delete bundle
    Given url opfabUrl + '/thirds/processes/api_test/versions/2'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

Scenario: check bundle doesn't exist anymore
    # Check bundle
    Given url opfabUrl + '/thirds/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404
