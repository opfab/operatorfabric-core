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
    And match response.states.conferenceState.userCard.template == 'usercard_conference'
    And match response.states.incidentInProgressState.userCard.template == 'usercard_incidentInProgress'
    And match response.states.incidentInProgressState.userCard.severityVisible == true
    And match response.states.incidentInProgressState.userCard.startDateVisible == false
    And match response.states.incidentInProgressState.userCard.endDateVisible == false

