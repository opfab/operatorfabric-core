
Feature: Cards

Scenario: Delete cards sent via postCardFor3Users.feature

# delete cards
Given url opfabPublishCardUrl + 'cards/api_test_process3users'
When method delete
Then status 200