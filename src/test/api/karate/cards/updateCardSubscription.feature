Feature: Update card Subscription

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}


    Scenario: update card subscription

    Scenario: Bad request

    Scenario: Without authentication

    Scenario: Subscription not found