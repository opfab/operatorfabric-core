Feature: Cards


Scenario: Delete cards sent via postCardsSeverity.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/api_test_process2'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test_process2b'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test_process3'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test_process4'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test_process5'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/api_test_process5b'
When method delete
Then status 200