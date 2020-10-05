Feature: getProcessGroups

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
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
    Then match response.groups[0].processes[0] == 'id_process1'
    Then match response.groups[0].processes[1] == 'id_process2'
    Then match response.groups[1].id == 'processgroupKarate2'
    Then match response.groups[1].processes[0] == 'id_process3'
    Then match response.groups[1].processes[1] == 'id_process4'
    Then match response.locale.en.processgroupKarate1 == 'Process Group Karate 1'
    Then match response.locale.en.processgroupKarate2 == 'Process Group Karate 2'
    Then match response.locale.fr.processgroupKarate1 == 'Groupe de process Karate 1'
    Then match response.locale.fr.processgroupKarate2 == 'Groupe de process Karate 2'


  Scenario: List existing process groups as non admin user
    Given url opfabUrl + '/businessconfig/processgroups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.groups.length == 2
    Then match response.groups[0].id == 'processgroupKarate1'
    Then match response.groups[0].processes[0] == 'id_process1'
    Then match response.groups[0].processes[1] == 'id_process2'
    Then match response.groups[1].id == 'processgroupKarate2'
    Then match response.groups[1].processes[0] == 'id_process3'
    Then match response.groups[1].processes[1] == 'id_process4'
    Then match response.locale.en.processgroupKarate1 == 'Process Group Karate 1'
    Then match response.locale.en.processgroupKarate2 == 'Process Group Karate 2'
    Then match response.locale.fr.processgroupKarate1 == 'Groupe de process Karate 1'
    Then match response.locale.fr.processgroupKarate2 == 'Groupe de process Karate 2'


  Scenario: List existing process groups without authentication
    Given url opfabUrl + '/businessconfig/processgroups'
    When method GET
    Then print response
    And status 401