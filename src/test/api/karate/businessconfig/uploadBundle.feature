Feature: Bundle

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get business process admin token
    * def signInAsBusinessAdmin = callonce read('../common/getToken.feature') { username: 'operator1_crisisRoom'}
    * def authTokenAsBusinessAdmin = signInAsBusinessAdmin.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post Bundle as ADMIN

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle without authentication
    # for the time being returns 403 instead of 401
    Given url opfabUrl + '/businessconfig/processes'
    And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 401

  Scenario: Post Bundle as BUSINESS ADMIN

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authTokenAsBusinessAdmin
    And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201


  Scenario: Post Bundle without admin role
        # for the time being returns 401 instead of 403
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = {read:'resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 403


  Scenario: Post Bundle for the same publisher but with another version

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_api_test_v2.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201
  
  
  Scenario: Post Bundle for testing the action

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_test_action.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

    Scenario: Post Bundle for big card (apogee)

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_api_test_apogee.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle for defaultProcess V1 (needed for cards sent by External App)

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_defaultProcess_V1.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle for process_1 (needed for tests in userCards.feature)

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_process_1.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle for process_2 (needed for tests in userCards.feature)

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_process_2.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle for processDeleteUserCard (needed for tests in deleteUserCard.feature)

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_processDeleteUserCard.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

  Scenario: Post Bundle with forbidden character in process id field
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_api_test_with_forbidden_processId.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 400
    And match response.message == 'The id of the process should not contain characters #, ?, /, \\'

