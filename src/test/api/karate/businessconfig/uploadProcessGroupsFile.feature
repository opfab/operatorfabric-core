Feature: uploadProcessGroups

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Post process groups file without authentication
    Given url opfabUrl + '/businessconfig/processgroups'
    And multipart file file = { read: 'resources/processgroups2.json' }
    When method post
    And status 401


  Scenario: Post process groups file without admin role
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = { read: 'resources/processgroups2.json' }
    When method post
    And status 403


  Scenario: Post process groups file with duplicate process
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processgroups2_with_duplicate_in_different_groups.json' }
    When method post
    And status 400


  Scenario: Post process groups file with duplicate process in the same group
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processgroups2_with_duplicate_in_same_group.json' }
    When method post
    And status 400


  Scenario: Post process groups file
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/processgroups2.json' }
    When method post
    And status 201


  Scenario: Check that process groups have been updated
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.groups.length == 2
    Then match response.groups[0].id == 'processgroupKarate3'
    Then match response.groups[0].name == 'Process Group Karate 3'
    Then match response.groups[0].processes[0] == 'id_process5'
    Then match response.groups[0].processes[1] == 'id_process6'
    Then match response.groups[1].id == 'processgroupKarate4'
    Then match response.groups[1].name == 'Process Group Karate 4'
    Then match response.groups[1].processes[0] == 'id_process7'
    Then match response.groups[1].processes[1] == 'id_process8'