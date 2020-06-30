Feature: Cards


Scenario: Delete cards sent via post3BigCards.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/APOGEESEA_SEA0'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/APOGEESEA_SEA1'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/APOGEESEA_SEA2'
When method delete
Then status 200
