Feature: Bundle

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
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
    And match response.states.questionState.userCard.template == 'usercard_question'
    And match response.states.questionState.userCard.severityVisible == false
    And match response.states.questionState.userCard.startDateVisible == true
    And match response.states.questionState.userCard.endDateVisible == true
    And match response.states.questionState.userCard.lttdVisible == true
    And match response.states.questionState.type == 'INPROGRESS'
    And match response.states.questionState.validateAnswerButtonLabel == 'Send impact'
    And match response.states.questionState.modifyAnswerButtonLabel == 'Modify impact'
    And match response.states.questionState.cancelAcknowledgmentAllowed == true
    And match response.states.questionState.closeCardWhenUserAcknowledges == true
    And match response.states.questionState.editCardEnabledOnUserInterface == true
    And match response.states.questionState.deleteCardEnabledOnUserInterface == true
    And match response.states.questionState.showAcknowledgmentFooter == 'OnlyForUsersAllowedToEdit'
    And match response.states.messageState.type == 'CANCELED'
    And match response.states.messageState.editCardEnabledOnUserInterface == false
    And match response.states.messageState.showAcknowledgmentFooter == 'OnlyForEmittingEntity'
    And match response.states.incidentInProgressState.userCard.template == 'usercard_incidentInProgress'
    And match response.states.incidentInProgressState.userCard.severityVisible == true
    And match response.states.incidentInProgressState.userCard.startDateVisible == false
    And match response.states.incidentInProgressState.userCard.endDateVisible == false
    And match response.states.incidentInProgressState.userCard.lttdVisible == false
    And match response.states.incidentInProgressState.userCard.recipientVisible == false
    And match response.states.incidentInProgressState.acknowledgmentAllowed == 'Always'
    And match response.states.incidentInProgressState.cancelAcknowledgmentAllowed == false
    And match response.states.incidentInProgressState.consideredAcknowledgedForUserWhen == 'AllEntitiesOfUserHaveAcknowledged'
    And match response.states.incidentInProgressState.type == 'FINISHED'
    And match response.states.incidentInProgressState.automaticPinWhenAcknowledged == true
    And match response.states.incidentInProgressState.closeCardWhenUserAcknowledges == false
    And match response.states.incidentInProgressState.deleteCardEnabledOnUserInterface == false
    And match response.states.incidentInProgressState.showAcknowledgmentFooter == 'ForAllUsers'





  Scenario: check bundle without authentication

    # Check bundle
    Given url opfabUrl + '/businessconfig/processes/api_test'
    When method GET
    Then status 200
