Feature: Cards


Scenario: Delete cards sent via postCardsSeverity.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/api_test.process1'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test.process2'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test.process3'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test.process4'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test.process5'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test.process6'
When method delete
Then status 200