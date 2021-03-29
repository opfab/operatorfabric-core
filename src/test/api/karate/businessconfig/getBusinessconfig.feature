Feature: getBusinessconfig

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push a bundle
          # Push bundle
      Given url opfabUrl + '/businessconfig/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
      When method post
      Then status 201

  Scenario: List existing Businessconfig

    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And assert response.length >= 1

  Scenario: List existing Businessconfig without authentication

    # Check bundle

    Given url opfabUrl + '/businessconfig/processes/'
    When method GET
    Then status 401


