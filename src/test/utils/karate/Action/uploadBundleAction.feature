Feature: uploadBundleAction

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

  
  Scenario: Post Bundle for testing the action

    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'bundle_test_action.tar.gz', contentType: 'application/gzip'}
    When method post
    Then print response
    And status 201