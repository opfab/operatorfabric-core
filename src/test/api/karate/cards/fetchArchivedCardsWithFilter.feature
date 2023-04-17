Feature: Archives


  Background:

    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken

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
	"data" : {"message":"new message (card 1)"}
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
    * def mycard =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "2",
	"process"  :"api_test",
	"processInstanceId" : "process10",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"severity" : "ALARM",
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"timespans test"},
	"startDate" : 1583568831000,
	"timeSpans" : [
        {"start" : 1583568831000},
        {"start" : 1583578831000}
    	]
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
        "right" : "Write"
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
	  "filters" : []
	}
	"""
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  Then status 200
	  And match response.numberOfElements == 9
  
  
	Scenario: fetch all archived cards for operator1_fr, not in admin mode
  
	  * def filter =
	  """
	  {
		"page" : 0,
		"size" : 10,
		"filters" : [],
		"adminMode":false
	  }
	  """
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  Then status 200
	  And assert response.numberOfElements == 9
  
  
	#Test parameter adminMode
	Scenario: fetch all archived cards for operator1_fr, in admin mode
  
	  * def filter =
	  """
	  {
		"page" : 0,
		"size" : 10,
		"filters" : [],
		"adminMode":true
	  }
	  """
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  And assert response.numberOfElements == 9
  
  
	#Test parameter adminMode
	Scenario: fetch all archived cards for admin, not in admin mode
  
	  * def filter =
	  """
	  {
		"page" : 0,
		"size" : 10,
		"filters" : [],
		"adminMode": false
	  }
	  """
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAdmin
	  And request filter
	  Then method post
	  And assert response.numberOfElements == 0
  
  
	#Test parameter adminMode
  Scenario: fetch all archived cards for admin, in admin mode
  
  
	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 10,
	  "filters" : [],
	  "adminMode": true
	}
	"""
  
	Given url opfabUrl + 'cards/archives'
	And header Authorization = 'Bearer ' + authTokenAdmin
	And request filter
	Then method post
	And assert response.numberOfElements == 10
  
  
  Scenario: change number of elements
  
	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 5,
	  "filters" : [],
	}
	"""
  
	Given url opfabUrl + 'cards/archives'
	And header Authorization = 'Bearer ' + authTokenAsTSO
	And request filter
	Then method post
	And match response.size == 5
	And match response.numberOfElements == 5
  
  Scenario: filter on a given publisher
  
	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 10,
	  "filters" : [
		{
		  "columnName": "publisher",
		  "filter" : ["operator1_fr"],
		  "matchType" : "EQUALS"
		}
	  ],
	}
	"""
  
	Given url opfabUrl + 'cards/archives'
	And header Authorization = 'Bearer ' + authTokenAsTSO
	And request filter
	Then method post
	Then status 200
	And assert response.numberOfElements == 9
  
  
  
  Scenario: without authentication
	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 10,
	  "filters" : [],
	}
	"""
  
	Given url opfabUrl + 'cards/archives'
	And request filter
	Then method post
	Then status 403
  
  
	 Scenario: filter on tag
  
	  * def filter =
	  """
	  {
		"page" : 0,
		"size" : 10,
		"filters" : [
		  {
			"columnName": "tags",
			"filter" : ["API"],
			"matchType" : "IN"
		  }
		],
	  }
	  """
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
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
  
	  Given url opfabUrl + 'cards/archives'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  Then status 200
	  And assert response.numberOfElements == 9
  
  
	Scenario: filter by activeFrom
  
	  * def filter =
	  """
	  {
		"page" : 0,
		"size" : 10,
		"filters" : [
		  {
			"columnName": "activeFrom",
			"filter" : ["1553186770481"]
		  }
		]
	  }
	  """
  
	  Given url opfabUrl + 'cards/archives' +'?activeFrom=1553186770481'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
	  And request filter
	  Then method post
	  Then status 200
	   And assert response.numberOfElements == 9
  
  
	  Scenario: filter by activeFrom after startDate of card with no endDate
  
		* def filter =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
			  "columnName": "activeFrom",
			  "filter" : ["1583333123000"]
			}
		  ]
		}
		"""
  
		Given url opfabUrl + 'cards/archives'
		And header Authorization = 'Bearer ' + authTokenAsTSO
		And request filter
		Then method post
		Then status 200
		 And assert response.numberOfElements == 8
  
		Scenario: filter by activeTo
  
		  * def filter =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				"columnName": "activeTo",
				"filter" : ["1653186770481"]
			  }
			]
		  }
		  """
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filter
		  Then method post
		  Then status 200
		  And assert response.numberOfElements == 9
  
  
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
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filter
		  Then method post
		  Then status 200
		  And assert response.numberOfElements == 9
  
  
		Scenario: fetch all archived cards, child cards included
  
		  * def filter =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"includeChildCards": true
		  }
		  """
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filter
		  Then method post
		  Then status 200
		  And assert response.numberOfElements == 10
  
		Scenario: fetch archived cards, child cards excluded
  
		  * def filter =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [],
			"includeChildCards": false
		  }
		  """
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filter
		  Then method post
		  Then status 200
		  And assert response.numberOfElements == 9
  
		Scenario: fetch archived cards (child cards excluded by default)
  
		  * def filter =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : []
		  }
		  """
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filter
		  Then method post
		  Then status 200
		  And assert response.numberOfElements == 9
  
  
		Scenario: filter equal, ignore case
				  
		  * def filterEQUALS =
		"""
		{
		  "page" : 0,
		  "size" : 10,
		  "filters" : [
			{
				"columnName": "titleTranslated",
				"filter" : ["CARD Title"],
				"matchType" : "EQUALS"
			  }
		  ]
		}
		"""
  
		  * def filterEQUALS2 =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["CARD Title"],
				  "matchType" : "NOTEQUAL"
				}
			]
		  }
		  """
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filterEQUALS
		  When method post
		  Then status 200
		  And assert response.numberOfElements == 9
  
  
		  Given url opfabUrl + 'cards/archives'
		  And header Authorization = 'Bearer ' + authTokenAsTSO
		  And request filterEQUALS2
		  When method post
		  Then status 200
		  And assert response.numberOfElements == 0
  
  
		  
		  Scenario: filter not equal, ignore case
				  
			* def filterNEQ =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["test"],
				  "matchType" : "NOTEQUAL"
				}
			]
		  }
		  """
  
			* def filterNEQ2 =
			"""
			{
			  "page" : 0,
			  "size" : 10,
			  "filters" : [
				{
					"columnName": "titleTranslated",
					"filter" : ["CARD Title"],
					"matchType" : "NOTEQUAL"
				  }
			  ]
			}
			"""
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNEQ
			When method post
			Then status 200
			And assert response.numberOfElements == 9
  
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNEQ2
			When method post
			Then status 200
			And assert response.numberOfElements == 0
		  
		  Scenario: filter starts with, ignore case
		  
			* def filterSW =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["CARD"],
				  "matchType" : "STARTSWITH"
				}
			]
		  }
		  """
  
			* def filterSW2 =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["test"],
				  "matchType" : "STARTSWITH"
				}
			]
		  }
		  """
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterSW
			  When method post
			Then status 200
			And assert response.numberOfElements == 9
		  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterSW2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0
  
		  Scenario: filter ends with, ignore case
  
			* def filterEW =
			"""
			{
			  "page" : 0,
			  "size" : 10,
			  "filters" : [
				{
					"columnName": "titleTranslated",
					"filter" : ["title"],
					"matchType" : "ENDSWITH"
				  }
			  ]
			}
			"""
  
			  * def filterEW2 =
			  """
			  {
				"page" : 0,
				"size" : 10,
				"filters" : [
				  {
					  "columnName": "titleTranslated",
					  "filter" : ["test"],
					  "matchType" : "ENDSWITH"
					}
				]
			  }
			  """
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterEW2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0
		  
		  Scenario: filter blank
				  
			* def filterBLANK =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "representative",
				  "matchType" : "BLANK"
				}
			]
		  }
		  """
  
				  
			* def filterBLANK2 =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "publisher",
				  "matchType" : "BLANK"
				}
			]
		  }
		  """
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterBLANK
			  When method post
			Then status 200
			And assert response.numberOfElements == 9
   
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterBLANK2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0
  
		  Scenario: filter not blank
		  
					
			* def filterNOTBLANK =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "publisher",
				  "matchType" : "NOTBLANK"
				}
			]
		  }
		  """
  
			* def filterNOTBLANK2 =
			"""
			{
			  "page" : 0,
			  "size" : 10,
			  "filters" : [
				{
					"columnName": "representative",
					"matchType" : "NOTBLANK"
				  }
			  ]
			}
			"""
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNOTBLANK
			  When method post
			Then status 200
			And assert response.numberOfElements == 9
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNOTBLANK2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0
		  
		  Scenario: filter contains ignore case
		  
					
			* def filterCONTAINS =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["rd TIT"],
				  "matchType" : "CONTAINS"
				}
			]
		  }
		  """
  
			* def filterCONTAINS2 =
			"""
			{
			  "page" : 0,
			  "size" : 10,
			  "filters" : [
				{
					"columnName": "titleTranslated",
					"filter" : ["test"],
					"matchType" : "CONTAINS"
				  }
			  ]
			}
			"""
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterCONTAINS
			  When method post
			Then status 200
			And assert response.numberOfElements == 9
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterCONTAINS2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0       
  
  
		  Scenario: filter not contains
				  
			* def filterNOTCONTAINS =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["test"],
				  "matchType" : "NOTCONTAINS"
				}
			]
		  }
		  """
  
			* def filterNOTCONTAINS2 =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["rd TIT"],
				  "matchType" : "NOTCONTAINS"
				}
			]
		  }
		  """
		  
		  Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNOTCONTAINS
			  When method post
			Then status 200
			And assert response.numberOfElements == 9 
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterNOTCONTAINS2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0 
  
  
		  Scenario: filter in list
				  
			* def filterIN =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["card Title 0","card Title","card Title"],
				  "matchType" : "IN"
				}
			]
		  }
		  """
  
			* def filterIN2 =
		  """
		  {
			"page" : 0,
			"size" : 10,
			"filters" : [
			  {
				  "columnName": "titleTranslated",
				  "filter" : ["card Title 0","card Title 1","card Title2"],
				  "matchType" : "IN"
				}
			]
		  }
		  """
		  
		  Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterIN
			  When method post
			Then status 200
			And assert response.numberOfElements == 9 
  
			Given url opfabUrl + 'cards/archives'
			And header Authorization = 'Bearer ' + authTokenAsTSO
			And request filterIN2
			  When method post
			Then status 200
			And assert response.numberOfElements == 0 
  
	Scenario: delete perimeter
	  #delete perimeter created previously
		Given url opfabUrl + 'users/perimeters/perimeter'
		And header Authorization = 'Bearer ' + authTokenAdmin
		When method delete
		Then status 200
