Feature: Cards


Scenario: Delete 2 cards sent via message1.feature and message2.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/message-publisher.hello-world-1'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/message-publisher.hello-world-2'
When method delete
Then status 200


