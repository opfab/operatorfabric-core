Feature: Card Filter


  Background:

    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInSupervisor = callonce read('../common/getToken.feature') { username: 'operator1_crisisroom'}
    * def authTokenSupervisor = signInSupervisor.authToken
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
        "state" : "incidentInProgressState",
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

  Scenario: Post 10 cards, fill the archive
    * def card1 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733122000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message1": "new message (card 1)", "message2": "another new message (card 1)"}
}
"""
	* def card2 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card2",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ACTION",
	"startDate" : 1583333122000,
	"lttd" : 1583339602000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card2) "}
}
"""
	* def card3 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card3",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "INFORMATION",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121993,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 3)"}
}
"""
	* def card4 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card4",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121994,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card4) "}
}
"""
	* def card5 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card5",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121995,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 5)"}
}
"""
	* def card6 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card6",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121996,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 6) "}

}
"""
	* def card7 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card7",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121997,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 7)"}
}
"""
	* def card8 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card8",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121998,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card8) "}
}
"""
	* def card9 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process2card9",
	"endDate" : 1583733122000,
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733121999,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card 9)"}
}
"""
	* def card10 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"parentCardId" : "api_test.process2card9",
	"process"  :"api_test",
	"processInstanceId" : "process2card10",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733122000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card10) "}
}
"""

    * def cardNotInPerimeters =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "cardNotInPerimeters0",
	"state": "incidentInProgressState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"startDate" : 1583333122000,
	"endDate" : 1583733122000,
	"lttd" : 1583733122000,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message (card10) "}
}
"""


#Create new perimeter
* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}

#Attach perimeter to group
    Given url opfabUrl + 'users/groups/Maintainer/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200


# Push cards, do retry on first post request because it can happen that the new  perimeter has not yet been propagated 
# to the publication service causing the test to fail 
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card1
	And retry until responseStatus == 201
    When method post
    Then status 201

    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card2
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card3
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card4
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card5
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card6
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card7
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card8
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card9
    When method post
    Then status 201

	Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card10
    When method post
    Then status 201

    Given url opfabPublishCardUrl + 'cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request cardNotInPerimeters
    When method post
    Then status 201


Scenario: fetch the first page

	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 10,
	  "filters" : [],
	}
	"""
  
	  Given url opfabUrl + 'cards-consultation/cards'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  Then status 200
	  And match response.numberOfElements == 10
  

	Scenario: fetch as Admin without adminMode

		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [],
		  "adminMode": false
		}
		"""
	  
		  Given url opfabUrl + 'cards-consultation/cards'
		  And header Authorization = 'Bearer ' + authTokenAdmin
		  And request filter
		  Then method post
		  Then status 200
		  And match response.numberOfElements == 0

	Scenario: fetch as Admin with adminMode

		* def filter =
		"""
		{
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"adminMode": true
		}
		"""
		
			Given url opfabUrl + 'cards-consultation/cards'
			And header Authorization = 'Bearer ' + authTokenAdmin
			And request filter
			Then method post
			Then status 200
			And match response.numberOfElements == 10

	Scenario: fetch as user with permission VIEW_ALL_CARDS without adminMode

		* def filter =
		"""
		{
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"adminMode": false
		}
		"""
		
			Given url opfabUrl + 'cards-consultation/cards'
			And header Authorization = 'Bearer ' + authTokenSupervisor
			And request filter
			Then method post
			Then status 200
			And match response.numberOfElements == 0
		
	Scenario: fetch as user with permission VIEW_ALL_CARDS with adminMode

		* def filter =
		"""
		{
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"adminMode": true
		}
		"""
		
			Given url opfabUrl + 'cards-consultation/cards'
			And header Authorization = 'Bearer ' + authTokenSupervisor
			And request filter
			Then method post
			Then status 200
			And match response.numberOfElements == 10


	Scenario: Create a group Supervisor2 with permission VIEW_ALL_CARDS_FOR_USER_PERIMETERS only

		* def groupSupervisor2 =
"""
{
  "id" : "Supervisor2",
  "name" : "Supervisor2",
  "description" : "Supervisor2 Group",
  "perimeters" : ["perimeter"],
  "permissions" : ["VIEW_ALL_CARDS_FOR_USER_PERIMETERS"]
}
"""

		* def usersArray =
"""
[   "operator1_crisisroom"
]
"""

		Given url opfabUrl + 'users/groups'
		And header Authorization = 'Bearer ' + authTokenAdmin
		And request groupSupervisor2
		When method post
		Then status 201
		And match response.id == groupSupervisor2.id
		And assert response.permissions.length == 1
		And match response.permissions contains only [ "VIEW_ALL_CARDS_FOR_USER_PERIMETERS"]


		Given url opfabUrl + 'users/groups/Supervisor/users/operator1_crisisroom'
		And header Authorization = 'Bearer ' + authTokenAdmin
		When method delete
		Then status 200

		Given url opfabUrl + 'users/groups/Supervisor2/users'
		And header Authorization = 'Bearer ' + authTokenAdmin
		And request usersArray
		When method patch
		And status 200

	Scenario: fetch as user with permission VIEW_ALL_CARDS_FOR_USER_PERIMETERS without adminMode

		* def filter =
		"""
		{
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"adminMode": false
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenSupervisor
		And request filter
		Then method post
		Then status 200
		And match response.numberOfElements == 0

	Scenario: fetch as user with permission VIEW_ALL_CARDS_FOR_USER_PERIMETERS with adminMode

		* def filter =
		"""
		{
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"adminMode": true
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenSupervisor
		And request filter
		Then method post
		Then status 200
		And match response.numberOfElements == 10


	Scenario: We set back user operator1_crisisroom in the Supervisor group

		* def usersArray =
"""
[   "operator1_crisisroom"
]
"""

		Given url opfabUrl + 'users/groups/Supervisor/users'
		And header Authorization = 'Bearer ' + authTokenAdmin
		And request usersArray
		When method patch
		And status 200

	Scenario: Delete the group Supervisor2
		Given url opfabUrl + 'users/groups/Supervisor2'
		And header Authorization = 'Bearer ' + authTokenAdmin
		When method delete
		Then status 200


	Scenario: filter on a given publish date
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "publishDateFrom",
			  "filter" : ["1553186770481"]
			}
		  ]
		}
		"""
	
		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 10


	Scenario: filter process
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "process",
			  "filter" : ["api_test"],
			  "matchType": "EQUALS"
			}
		  ]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 10


	Scenario: filter processInstanceId which returns only one card, specifying selected fields in return

		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "processInstanceId",
			  "filter" : ["process2card1"],
			  "matchType": "EQUALS"
			}
		  ],
		  "selectedFields" : ["data.message1", "data.message2"]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 1
		And match response.content[0].message1 == "new message (card 1)"
		And match response.content[0].message2 == "another new message (card 1)"

	Scenario: filter by wrong process
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "process",
			  "filter" : ["wrong-test"],
			  "matchType": "EQUALS"
			}
		  ]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 0


	Scenario: filter state
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "state",
			  "filter" : ["messageState"],
			  "matchType": "EQUALS"
			}
		  ]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 9


	Scenario: filter wrong state
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "state",
			  "filter" : ["wrongState"],
			  "matchType": "EQUALS"
			}
		  ]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 0


	Scenario: filter state and severity
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "state",
			  "filter" : ["messageState"],
			  "matchType": "EQUALS"
			},
			{
			  "columnName": "severity",
			  "filter" : ["ALARM"],
			  "matchType": "EQUALS"
			}
		  ]
		}
		"""

		Given url opfabUrl + 'cards-consultation/cards'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		And assert response.numberOfElements == 7
	

	Scenario: delete perimeter
	  #delete perimeter created previously
		* callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}
