Feature: Posting cards with unexisting i18n file in bundle, and with i18n file but without i18n key


  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post card with unexisting i18n file

    * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "ReceiveAndWrite"
      }
    ]
}
"""

    * def perimeterArray =
"""
[   "perimeter"
]
"""

# Create new perimeter
# use retry to avoid flaky test when previous test ask for perimeter delete
# but the processing is not finished when we create the perimeter
# resulting in a bad response : 
#  {"status":"BAD_REQUEST","message":"Resource creation failed because a resource with the same key already exists.","errors":["Duplicate key : perimeter"]}
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter
    And retry until responseStatus == 201
    When method post
    Then status 201

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeterArray
    When method patch
    Then status 200

    
  # We post an update for bundle api_test, version=1, which does not contain i18n file
  # Post bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'../businessconfig/resources/bundle_api_test_without_i18n_file.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithUnexistingI18nFile",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "message.summary"},
	"title" : {"key" : "message.title"},
	"data" : {"message":"a message"}
}
"""

# We push card for the bundle previously pushed (without i18n file)
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card : no i18n file for process=api_test, processVersion=1 (processInstanceId=cardWithUnexistingI18nFile)'


  Scenario: We post original bundle for api_test (which contains i18n file) and we post cards with unexisting i18n key

  # We post original bundle api_test, version=1
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'../businessconfig/resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201


    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithExistingI18nFileButUnexistingI18nKey",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "message.unexistingI18nKeyForSummary"},
	"title" : {"key" : "message.title"},
	"data" : {"message":"a message"}
}
"""

# Push card with unexisting i18n key for summary field
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card : no i18n translation for key=message.unexistingI18nKeyForSummary (process=api_test, processVersion=1, processInstanceId=cardWithExistingI18nFileButUnexistingI18nKey)'

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithExistingI18nFileButUnexistingI18nKey",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "message.summary"},
	"title" : {"key" : "message.unexistingI18nKeyForTitle"},
	"data" : {"message":"a message"}
}
"""

# Push card with unexisting i18n key for title field
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card : no i18n translation for key=message.unexistingI18nKeyForTitle (process=api_test, processVersion=1, processInstanceId=cardWithExistingI18nFileButUnexistingI18nKey)'


    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithExistingI18nKeys",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "message.summary"},
	"title" : {"key" : "message.title"},
	"data" : {"message":"a message"}
}
"""

# Push card with existing i18n keys for title and summary
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.id == 'api_test.cardWithExistingI18nKeys'

#delete perimeter created previously
Given url opfabUrl + 'users/perimeters/perimeter'
And header Authorization = 'Bearer ' + authToken
When method delete
Then status 200