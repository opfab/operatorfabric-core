Feature: deleteBundle

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

  Scenario: Delete a Third without authentication
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    When method DELETE
    Then print response
    And status 401

  Scenario: Delete a Third
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

  Scenario: Delete a not existing Third
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 404
    And print response


