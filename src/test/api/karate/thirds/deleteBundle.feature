Feature: deleteBundle

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
   #Using callonce to make the call just once at the beginnig   
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken   
   #The "." in the middle of the following file path is just a trick to force 
   #karate to make a second and final call to getToken.feature
    * def signInAsTSO = callonce read('../common/./getToken.feature') { username: 'tso1-operator'}
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

  Scenario: Delete a Third Version with a authentication having insufficient privileges
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method DELETE
    Then print response
    And status 403

  Scenario: Delete a Third
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

  Scenario: check bundle doesn't exist anymore
    # Check bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Delete a not existing Third
    # Delete bundle
    Given url opfabUrl + 'thirds/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 404
    And print response


