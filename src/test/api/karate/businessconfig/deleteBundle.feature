Feature: deleteBundle

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
   #Using callonce to make the call just once at the beginning
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken   
   #The "." in the middle of the following file path is just a trick to force 
   #karate to make a second and final call to getToken.feature
    * def signInAsTSO = callonce read('../common/./getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push a bundle
          # Push bundle
      Given url opfabUrl + '/businessconfig/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
      When method post
      Then print response
      And status 201

  Scenario: Delete a Businessconfig without authentication
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    When method DELETE
    Then print response
    And status 401

  Scenario: Delete a Businessconfig Version with a authentication having insufficient privileges
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method DELETE
    Then print response
    And status 403

  Scenario: Delete a Businessconfig
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And print response
    And assert response.length == 0

  Scenario: check bundle doesn't exist anymore
    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

  Scenario: Delete a not existing Businessconfig
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 404
    And print response


