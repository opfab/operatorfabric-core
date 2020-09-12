Feature: Cards


Scenario: Delete cards sent via postCardsSeverity.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/defaultProcess.processOld'
When method delete
Then status 200
