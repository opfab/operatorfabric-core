
Feature: Cards

Background:
    #Getting token for admin and operator1 user calling getToken.feature
     * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1'}
     * def authTokenAsTSO = signInAsTSO.authToken

Scenario: Delete cards sent via postCardFor3Users.feature

# delete cards
Given url opfabPublishCardUrl + 'cards/api_test.process3users'
And header Authorization = 'Bearer ' + authTokenAsTSO
When method delete
Then status 200