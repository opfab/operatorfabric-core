Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: check bundle

    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'api_test'
    And match response.uiVisibility.monitoring == true
    And match response.uiVisibility.logging == true
    And match response.uiVisibility.calendar == true
    And match response.statesData.questionState.userCard.template == 'usercard_question'
    And match response.statesData.questionState.userCard.severityVisible == false
    And match response.statesData.questionState.userCard.startDateVisible == true
    And match response.statesData.questionState.userCard.endDateVisible == true
    And match response.statesData.incidentInProgressState.userCard.template == 'usercard_incidentInProgress'
    And match response.statesData.incidentInProgressState.userCard.severityVisible == true
    And match response.statesData.incidentInProgressState.userCard.startDateVisible == false
    And match response.statesData.incidentInProgressState.userCard.endDateVisible == false
    And match response.statesData.incidentInProgressState.acknowledgmentAllowed == 'Always'




  Scenario: check bundle without authentication

    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    When method GET
    Then print response
    And status 401
