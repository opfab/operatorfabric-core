Feature: Posting card with a process and/or a state that doesn't exist in bundles


  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def perimeter =
  """
  {
    "id" : "perimeter",
    "process" : "api_test",
    "stateRights" : [
        {
          "state" : "messageState",
          "right" : "ReceiveAndWrite"
        },
        {
          "state" : "newState",
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

  Scenario: Post card with unexisting process

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "unexistingProcess",
	"processVersion" : "1",
	"processInstanceId" : "cardWithUnexistingProcess",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""
  
  #Create new perimeter
  * callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authToken)'}
  
  #Attach perimeter to group
      Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
      And header Authorization = 'Bearer ' + authToken
      And request perimeterArray
      When method patch
      Then status 200
  

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card because process and/or state does not exist (process=unexistingProcess, state=messageState, processVersion=1, processInstanceId=cardWithUnexistingProcess)'


  Scenario: Post card with unexisting state

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithUnexistingState",
	"state": "unexistingState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card because process and/or state does not exist (process=api_test, state=unexistingState, processVersion=1, processInstanceId=cardWithUnexistingState)'


  Scenario: Post card with existing process and state but with unexisting processVersion

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "99",
	"processInstanceId" : "cardWithUnexistingProcessVersion",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card because process and/or state does not exist (process=api_test, state=messageState, processVersion=99, processInstanceId=cardWithUnexistingProcessVersion)'


  Scenario: With the tests below, we check the cache containing bundles is updated when we push an update for a bundle, or when we delete a bundle.

    # We post a card with existing process and state, with bundle for api_test and version 1, to be sure the bundle is in the cache

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithExistingProcessAndState",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    # Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 201
    And match response.id == 'api_test.cardWithExistingProcessAndState'


  # We post a card with same bundle than previously, because we know it is in the cache, but we set unexisting state in the card and we check the push is failed

    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithNewState",
	"state": "newState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    # Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card because process and/or state does not exist (process=api_test, state=newState, processVersion=1, processInstanceId=cardWithNewState)'


    # We post an update for bundle api_test, version=1, which contains the state "newState"
    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'../businessconfig/resources/bundle_api_test_with_newState.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201


    # We push same card than previously, and we check now pushing the card is successful (this test is to be sure the cache is updated when we push a bundle)
    # Use retry to avoid flaky test when cache is not yet updated
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    And retry until responseStatus == 201
    When method post
    Then status 201
    And match response.id == 'api_test.cardWithNewState'


    # We delete the bundle previously pushed
    Given url opfabUrl + '/businessconfig/processes/api_test/versions/1'
    And header Authorization = 'Bearer ' + authToken
    When method DELETE
    Then status 204
    And assert response.length == 0


    * def card =
"""
{
	"publisher" : "operator1_fr",
	"process" : "api_test",
	"processVersion" : "1",
	"processInstanceId" : "cardWithNewStateButBundleDeleted",
	"state": "newState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message"}
}
"""

    # We push a card corresponding to the bundle previously deleted and we check the push is failed
    # Add a retry to avoid flaky test when the delete information has not yet been propagated 
    # to the publication service when making the request 
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card
    And retry until responseStatus == 400
    When method post
    Then status 400
    And match response.status == 'BAD_REQUEST'
    And match response.message == 'Impossible to publish card because process and/or state does not exist (process=api_test, state=newState, processVersion=1, processInstanceId=cardWithNewStateButBundleDeleted)'


    # We post original bundle api_test, version=1, to clean the updates we have made in this test file
    # Push bundle
    Given url opfabUrl + '/businessconfig/processes'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = {read:'../businessconfig/resources/bundle_api_test.tar.gz', contentType: 'application/gzip'}
    When method post
    Then status 201

    #delete perimeter created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authToken)'}