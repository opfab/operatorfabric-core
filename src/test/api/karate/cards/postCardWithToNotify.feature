Feature: postCardWithToNotify

  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

  Scenario: postCardWithToNotify

    * def cardWithToNotifySetToTrue =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process_postCardWithToNotifySetToTrue",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583943924000,
	"endDate" : 1584943924000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message with toNotify=true"},
	"toNotify" : true
}
"""

    * def cardWithToNotifySetToFalse =
"""
{
	"publisher" : "operator1",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process_postCardWithToNotifySetToFalse",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583943924000,
	"endDate" : 1584943924000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"a message with toNotify=false"},
	"toNotify" : false
}
"""

    * def perimeter =
"""
{
  "id" : "perimeter",
  "process" : "api_test",
  "stateRights" : [
      {
        "state" : "messageState",
        "right" : "Receive"
      }
    ]
}
"""

    * def perimeterArray =
"""
[   "perimeter"
]
"""

#Create new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeter
    When method post
    Then status 201

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request cardWithToNotifySetToTrue
    When method post
    Then status 201


#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.process_postCardWithToNotifySetToTrue'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.card.data.message == 'a message with toNotify=true'
    And def cardUid = response.card.uid

#get card form archives with user operator1

    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'a message with toNotify=true'

# Push card
    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authToken
    And request cardWithToNotifySetToFalse
    When method post
    Then status 201
    And def cardUid = response.uid


#get card with user operator1
    Given url opfabUrl + 'cards/cards/api_test.process_postCardWithToNotifySetToFalse'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404

#get card form archives with user operator1

    Given url opfabUrl + 'cards/archives/' + cardUid
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.data.message == 'a message with toNotify=false'

#delete perimeter created previously
      Given url opfabUrl + 'users/perimeters/perimeter'
      And header Authorization = 'Bearer ' + authTokenAdmin
      When method delete
      Then status 200