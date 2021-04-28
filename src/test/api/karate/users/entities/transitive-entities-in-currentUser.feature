Feature: Check addition of transitive entities to user

    Background:
        * def adminSignIn = callonce read('../../common/getToken.feature') { username: 'admin'}
        * def adminToken = adminSignIn.authToken
        * def rootSignIn = callonce read('../../common/getToken.feature') { username: 'user_test_api_2'}
        * def rootToken = rootSignIn.authToken
		* def singleSignIn = callonce read('../../common/getToken.feature') { username: 'user_test_api_1'}
		* def singleToken =  singleSignIn.authToken
		* def childAndGrandChildSignIn = callonce read('../../common/getToken.feature') { username: 'user_test_api_3'}
		* def childAndGrandChildToken = childAndGrandChildSignIn.authToken
		* def withoutChildSignIn = callonce read('../../common/getToken.feature') { username: 'user_test_api_4'}
		* def withoutChildToken = withoutChildSignIn.authToken

        # entities
        * def rootEntity =
        """
        {
            "id": "root-entity",
            "name":"Root Entity",
            "description":"Entity without parent but descendant"
        }
        """
        * def childEntity =
        """
        {
            "id": "child-entity",
            "name":"Child Entity",
            "description":"Entity with one parent and one descendant",
            "parents":["root-entity"]
        }
        """
        * def grandChildEntity =
        """
        {
            "id": "grand-child-entity",
            "name":"Grand Child Entity",
            "description":"Entity with one parent and one descendant",
            "parents":["child-entity"]
        }
        """
        * def singleEntity =
        """
        {
            "id": "single-entity",
            "name":"Single Entity",
            "description":"Entity without any parent or descendant"
        }
        """

        # Users
        * def userWithSingleEntity =
        """
        {
            "login":"user_test_api_1",
            "groups":["Dispatcher"],
            "entities":["single-entity"]
        }
        """
        * def userWithRootEntityOnly =
        """
        {
            "login":"user_test_api_2",
            "groups":["Dispatcher"],
            "entities":["root-entity"]
        }
        """
        * def userWithChildAndGrandChildEntities =
        """
        {
            "login":"user_test_api_3",
            "groups":["Dispatcher"],
            "entities":["child-entity","grand-child-entity"]
        }
        """
        * def userWithoutChildEntity =
        """
        {
            "login":"user_test_api_4",
            "groups":["Dispatcher"],
            "entities":["single-entity","grand-child-entity","root-entity"]
        }
        """

	# Cards
    	* def cardToSingle =
        """
        {
        	"publisher" : "api_test",
        	"processVersion" : "1",
        	"process"  :"api_test",
        	"processInstanceId" : "4-single-entity",
        	"state": "messageState",
        	"groupRecipients": ["Dispatcher"],
                "entityRecipients":["single-entity"],
                "severity" : "INFORMATION",
        	"startDate" : 1553186770681,
        	"summary" : {"key" : "defaultProcess.summary"},
        	"title" : {"key" : "defaultProcess.title"},
        	"data" : {"message":"a message"}
        }
        """
    	* def cardToRoot =
        """
        {
        	"publisher" : "api_test",
        	"processVersion" : "1",
        	"process"  :"api_test",
        	"processInstanceId" : "4-root-entity",
        	"state": "messageState",
        	"groupRecipients": ["Dispatcher"],
                "entityRecipients":["root-entity"],
                "severity" : "INFORMATION",
        	"startDate" : 1553186770681,
        	"summary" : {"key" : "defaultProcess.summary"},
        	"title" : {"key" : "defaultProcess.title"},
        	"data" : {"message":"a message"}
        }
        """
    	* def cardToChild =
        """
        {
        	"publisher" : "api_test",
        	"processVersion" : "1",
        	"process"  :"api_test",
        	"processInstanceId" : "4-child-entity",
        	"state": "messageState",
        	"groupRecipients": ["Dispatcher"],
                "entityRecipients":["child-entity"],
                "severity" : "INFORMATION",
        	"startDate" : 1553186770681,
        	"summary" : {"key" : "defaultProcess.summary"},
        	"title" : {"key" : "defaultProcess.title"},
        	"data" : {"message":"a message"}
        }
        """
    	* def CardToGrandChild =
        """
        {
        	"publisher" : "api_test",
        	"processVersion" : "1",
        	"process"  :"api_test",
        	"processInstanceId" : "4-grand-child-entity",
        	"state": "messageState",
        	"groupRecipients": ["Dispatcher"],
                "entityRecipients":["grand-child-entity"],
                "severity" : "INFORMATION",
        	"startDate" : 1553186770681,
        	"summary" : {"key" : "defaultProcess.summary"},
        	"title" : {"key" : "defaultProcess.title"},
        	"data" : {"message":"a message"}
     	}
        """

# Setup
        Scenario Outline: Add new entities

            Given url opfabUrl + 'users/entities'
            And header Authorization = 'Bearer ' + adminToken
            And request <entity>
            When method post
            Then status <expected>

            Examples:
                |entity          |expected|
                |rootEntity      |201     |
                |childEntity     |201     |
                |grandChildEntity|201     |
                |singleEntity    |201     |

	Scenario Outline: Add users

    	    Given url opfabUrl + "users/users"
    	    And header Authorization = "Bearer " + adminToken
    	    And request <user>
    	    When method post
    	    Then status <expected>

    	    Examples:
              |user                              |expected|
              |userWithSingleEntity              |201     |
              |userWithRootEntityOnly            |201     |
              |userWithChildAndGrandChildEntities|201     |
              |userWithoutChildEntity            |201     |
# Effective tests
# Create cards
	Scenario Outline: Send cards
    	Given url opfabPublishCardUrl + 'cards'
    	And request <card>
    	When method post
    	Then status 201

    	Examples:
        	|card            |
        	|cardToSingle    |
        	|cardToRoot      |
        	|cardToChild     |
        	|CardToGrandChild|
# get cards
 	Scenario Outline: Get cards for user with single entity (user_test_api_1)

     		Given url opfabUrl + 'cards/cards/' + <card>.publisher+'.'+<card>.processInstanceId
     		And header Authorization = 'Bearer ' + singleToken
     		When method get
     		Then status <expected>

     		Examples:
         		|card            |expected|
         		|cardToRoot      |404     |
         		|cardToSingle    |200     |
         		|cardToChild     |404     |
         		|CardToGrandChild|404     |

 	Scenario Outline: Get cards for user with root entity only (user_test_api_2)

     		Given url opfabUrl + 'cards/cards/' + <card>.publisher+'.'+<card>.processInstanceId
     		And header Authorization = 'Bearer ' + rootToken
     		When method get
     		Then status <expected>

     		Examples:
         		|card            |expected|
         		|cardToRoot      |200     |
         		|cardToSingle    |404     |
         		|cardToChild     |404     |
         		|CardToGrandChild|404     |

 	Scenario Outline: Get cards for user with child and grand child entity (user_test_api_3)

     		Given url opfabUrl + 'cards/cards/' + <card>.publisher+'.'+<card>.processInstanceId
     		And header Authorization = 'Bearer ' + childAndGrandChildToken
     		When method get
     		Then status <expected>

     		Examples:
         		|card            |expected|
         		|cardToRoot      |200     |
         		|cardToSingle    |404     |
         		|cardToChild     |200     |
         		|CardToGrandChild|200     |

 	Scenario Outline: Get cards for user without child entity (user_test_api_4)

     		Given url opfabUrl + 'cards/cards/' + <card>.publisher+'.'+<card>.processInstanceId
     		And header Authorization = 'Bearer ' + withoutChildToken
     		When method get
     		Then status <expected>

     		Examples:
         		|card            |expected|
         		|cardToRoot      |200     |
         		|cardToSingle    |200     |
         		|cardToChild     |200     |
         		|CardToGrandChild|200     |

# Tear down
        Scenario Outline: delete users
    
    	    Given url opfabUrl + "users/users/" + <user>.login
    	    And header Authorization = "Bearer " + adminToken
    	    When method delete
    	    Then status <expected>

    	    Examples:
              |user                              |expected|
              |userWithSingleEntity              |200     |
              |userWithRootEntityOnly            |200     |
              |userWithChildAndGrandChildEntities|200     |
              |userWithoutChildEntity            |200     |

        Scenario Outline: Delete previously added Entities

            Given url opfabUrl + 'users/entities/' + <entityId>
            And header Authorization = 'Bearer ' + adminToken
            When method delete
            Then status <expected>

            Examples:
                |entityId            |expected|
                |rootEntity.id       |200     |
                |childEntity.id      |200     |
                |grandChildEntity.id |200     |
                |singleEntity.id     |200     |
