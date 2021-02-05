Feature: Process groups

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post process groups file
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processgroups.json' }
    When method post
    And status 201


  Scenario: Check that process groups have been updated
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200

