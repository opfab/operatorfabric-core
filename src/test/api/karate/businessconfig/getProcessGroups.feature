Feature: getProcessGroups

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Push a process groups file
     Given url opfabUrl + '/businessconfig/processgroups'
     And header Authorization = 'Bearer ' + authToken
     And multipart file file = { read: 'resources/processgroups1.json' }
     When method post
     Then status 201


  Scenario: List existing process groups as admin user
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And assert response.groups.length == 2
    Then match response.groups[0].id == 'processgroupKarate1'
    Then match response.groups[0].name == 'Process Group Karate 1'
    Then match response.groups[0].processes[0] == 'id_process1'
    Then match response.groups[0].processes[1] == 'id_process2'
    Then match response.groups[1].id == 'processgroupKarate2'
    Then match response.groups[1].name == 'Process Group Karate 2'
    Then match response.groups[1].processes[0] == 'id_process3'
    Then match response.groups[1].processes[1] == 'id_process4'


  Scenario: List existing process groups as non admin user
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.groups.length == 2
    Then match response.groups[0].id == 'processgroupKarate1'
    Then match response.groups[0].name == 'Process Group Karate 1'
    Then match response.groups[0].processes[0] == 'id_process1'
    Then match response.groups[0].processes[1] == 'id_process2'
    Then match response.groups[1].id == 'processgroupKarate2'
    Then match response.groups[1].name == 'Process Group Karate 2'
    Then match response.groups[1].processes[0] == 'id_process3'
    Then match response.groups[1].processes[1] == 'id_process4'


  Scenario: List existing process groups without authentication
    Given url opfabUrl + '/businessconfig/processgroups'
    When method GET
    Then status 401