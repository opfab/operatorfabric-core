Feature: getBusinessconfigHistory

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: Push two versions of a bundle 
          # Push bundle
      Given url opfabUrl + '/businessconfig/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
      When method post
      Then status 201

      Given url opfabUrl + '/businessconfig/processes'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = {read:'resources/bundle_api_test_v2.tar.gz', contentType: 'application/gzip'}
      When method post
      Then status 201

  Scenario: List existing Businessconfig history

    # Check bundle
    Given url opfabUrl + '/businessconfig/processhistory/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And assert response.length == 2
    And assert response[0].id == 'api_test'
    And assert response[0].version == '1'
    And assert response[1].id == 'api_test'
    And assert response[1].version == '2'


  Scenario: List existing Businessconfig history without authentication

    # Check bundle

    Given url opfabUrl + '/businessconfig/processhistory/api_test'
    When method GET
    Then status 200
    And assert response.length == 2
    And assert response[0].id == 'api_test'
    And assert response[0].version == '1'
    And assert response[1].id == 'api_test'
    And assert response[1].version == '2'

  Scenario: List not existing Businessconfig history

    # Check bundle
    Given url opfabUrl + '/businessconfig/processhistory/not_existent'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404

