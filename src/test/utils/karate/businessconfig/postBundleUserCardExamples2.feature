Feature: Bundle

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundle


     # Push bundle
    Given url opfabUrl + 'businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundle_userCardExamples2.tar.gz')
    When method post
    Then status 201

    # Check bundle
    Given url opfabUrl + 'businessconfig/processes/userCardExamples2'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 200
    And match response.id == 'userCardExamples2'
    And match response.states.questionState.userCard.template == 'usercard_question'
    And match response.states.questionState.userCard.severityVisible == false
    And match response.states.questionState.userCard.startDateVisible == true
    And match response.states.questionState.userCard.endDateVisible == true
    And match response.states.questionState.userCard.lttdVisible == true
    And match response.states.questionState.showDetailCardHeader == false
    And match response.states.messageState.userCard.template == 'usercard_message'
