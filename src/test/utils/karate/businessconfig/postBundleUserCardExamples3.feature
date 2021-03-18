Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle


     # Push bundle
    Given url opfabUrl + 'businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'resources/bundle_userCardExamples3.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'businessconfig/processes/userCardExamples3'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'userCardExamples3'
    And match response.states.taskState.userCard.template == 'usercard_task'
