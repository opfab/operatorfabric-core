Feature: getThirds

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push a bundle
          # Push bundle
      Given url opfabUrl + 'thirds'
      And header Authorization = 'Bearer ' + authToken
      And multipart field file = read('resources/bundle_api_test.tar.gz')
      When method post
      Then print response
      And status 201

  Scenario: List existing Third

    # Check bundle
    Given url opfabUrl + 'thirds/'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And print response
    And assert response.length >= 1

  Scenario: List existing Third without authentication

    # Check bundle

    Given url opfabUrl + 'thirds/'
    When method GET
    Then print response
    And status 401


