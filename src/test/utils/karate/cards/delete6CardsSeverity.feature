Feature: Cards


Scenario: Delete cards sent via postCardsSeverity.feature


# delete cards
Given url opfabPublishCardUrl + 'cards/defaultProcess.process1'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/defaultProcess.process2'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/defaultProcess.process3'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/defaultProcess.process4'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/defaultProcess.process5'
When method delete
Then status 200

Given url opfabPublishCardUrl + 'cards/defaultProcess.process6'
When method delete
Then status 200

####################################
Given url opfabPublishCardUrl + 'cards/defaultProcess.processInstanceSentByENTITY1'
When method delete
Then status 200