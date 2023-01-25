Feature: deleteBundle

  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken   

    * def signInAsBusinessAdmin = callonce read('../common/getToken.feature') { username: 'operator1_crisisRoom'}
    * def authTokenAsBusinessAdmin = signInAsBusinessAdmin.authToken

    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push a bundle
          # Push bundle
      Given url opfabUrl + '/businessconfig/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
      When method post
      Then status 201

  Scenario: Delete a Businessconfig without authentication
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    When method DELETE
    Then status 401

  Scenario: Delete a Businessconfig Version with a authentication having insufficient privileges
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method DELETE
    Then status 403

  Scenario: Delete a Businessconfig
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
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

  Scenario: Push a bundle as business process admin
    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authTokenAsBusinessAdmin
    And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Delete a Businessconfig bundle as business process admin
    # Delete bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authTokenAsBusinessAdmin
    When method DELETE
    Then status 204
    And assert response.length == 0

  Scenario: check bundle doesn't exist anymore
    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authTokenAsBusinessAdmin
    When method GET
    Then status 404
