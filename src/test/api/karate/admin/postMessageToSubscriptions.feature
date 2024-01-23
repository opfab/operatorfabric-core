Feature: post message to subscriptions

  Background:
   #Getting token for admin and user_test_api_1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'user_test_api_1'}
    * def authTokenAsTSO = signInAsTSO.authToken



  Scenario: post message as admin user
    Given url opfabCardsConsultationUrl + '/messageToSubscriptions'
    And header Authorization = 'Bearer ' + authToken
    And request 'RELOAD'
    When method POST
    Then status 200


  Scenario: post message as non admin user
    Given url opfabCardsConsultationUrl + '/messageToSubscriptions'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request 'RELOAD'
    When method POST
    Then status 403


