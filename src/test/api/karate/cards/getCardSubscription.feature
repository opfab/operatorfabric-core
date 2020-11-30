Feature: get card Subscription

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    Scenario: get card subscription
      Given url opfabUrl + 'cards/cardSubscription' +'?clientId=abc0123456789def'
      And header Authorization = 'Bearer ' + authToken
      When method get
      Then print response
      And status 200

    Scenario: Without authentication
      Given url opfabUrl + 'cards/cardSubscription'
      When method get
      Then print response
      And status 401

  Scenario: get card subscription with user operator1
    Given url opfabUrl + 'cards/cardSubscription' +'?clientId=ghi0123456789jkl'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then print response
    And status 200
