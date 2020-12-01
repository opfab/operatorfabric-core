Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle


     # Push bundle
    Given url opfabUrl + 'businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundle_userCardExamples.tar.gz')
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'businessconfig/processes/userCardExamples'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'userCardExamples'
    And match response.statesData.questionState.userCard.template == 'usercard_question'
    And match response.statesData.questionState.userCard.severityVisible == false
    And match response.statesData.questionState.userCard.startDateVisible == true
    And match response.statesData.questionState.userCard.endDateVisible == true
    And match response.statesData.incidentInProgressState.userCard.template == 'usercard_incidentInProgress'
    And match response.statesData.incidentInProgressState.userCard.severityVisible == true
    And match response.statesData.incidentInProgressState.userCard.startDateVisible == false
    And match response.statesData.incidentInProgressState.userCard.endDateVisible == false

