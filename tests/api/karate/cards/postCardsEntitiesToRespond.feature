Feature: Post cards with entitiesAllowedToRespond and/or entitiesRequiredToRespond set

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
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
	
  Scenario: Push cards with different values of entitiesAllowedToRespond and entitiesRequiredToRespond (all these tests correspond to successful cards creations)

	#Create new perimeter
	* callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeter)', token: '#(authTokenAdmin)'}
	
	#Attach perimeter to group
		Given url opfabUrl + 'users/groups/Maintainer/perimeters'
		And header Authorization = 'Bearer ' + authTokenAdmin
		And request perimeterArray
		When method patch
		Then status 200

    * def card1 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"entitiesAllowedToRespond": ["ENTITY1_FR"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card with only entitiesAllowedToRespond set
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card1
    When method post
    Then status 201

    * def card2 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"entitiesAllowedToRespond": ["ENTITY1_FR","ENTITY2_FR","ENTITY3_FR"],
	"entitiesRequiredToRespond": ["ENTITY1_FR","ENTITY2_FR"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card with entitiesAllowedToRespond set and entitiesRequiredToRespond set to a subset of entitiesAllowedToRespond
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card2
    When method post
    Then status 201


    * def card3 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"entitiesRequiredToRespond": ["ENTITY3_FR"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card with only entitiesRequiredToRespond set
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card3
    When method post
    Then status 201

    * def card4 =
"""
{
	"publisher" : "operator1_fr",
	"processVersion" : "1",
	"process"  :"api_test",
	"processInstanceId" : "process1",
	"state": "messageState",
	"groupRecipients": ["Dispatcher"],
	"entitiesAllowedToRespond": ["ENTITY1_FR","ENTITY2_FR"],
	"entitiesRequiredToRespond": ["ENTITY2_FR","ENTITY3_FR"],
	"severity" : "INFORMATION",
	"startDate" : 1553186770681,
	"summary" : {"key" : "defaultProcess.summary"},
	"title" : {"key" : "defaultProcess.title"},
	"data" : {"message":"new message"}
}
"""

# Push card with both properties set but with entitiesRequiredToRespond containing entities that are not in entitiesAllowedToRespond
    Given url opfabPublishCardUrl + 'cards'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request card4
    When method post
    Then status 201

#delete perimeter created previously
* callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)'}