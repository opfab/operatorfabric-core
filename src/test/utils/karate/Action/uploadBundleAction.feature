Feature: API - uploadBundleAction

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

  
  Scenario: Post Bundle for testing the action

    # Push bundle
    Given url opfabUrl + 'thirds'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('bundle/bundle_test_action_v2.tar.gz')
    When method post
    Then print response
    And status 201