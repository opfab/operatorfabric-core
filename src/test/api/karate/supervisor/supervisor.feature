Feature: Supervisor


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def signInSupervisor = callonce read('../common/getToken.feature') { username: 'opfab'}
    * def authTokenSupervisor = signInSupervisor.authToken



Scenario: start/stop/status API 

    # Call API as non admin user should fail
    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2108/stop'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    Given url 'http://localhost:2108/start'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    # Call API as admin user

    # service status is not active at startup
    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) == 'false'

    Given url 'http://localhost:2108/start'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'Start supervisor'

    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'true'


    Given url 'http://localhost:2108/stop'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) == 'Stop supervisor'


    Given url 'http://localhost:2108/status'
	And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And  match karate.toString(response) ==  'false'

  
Scenario: Check card is sent when entities are not connected

    * def perimeter =
    """
    {
      "id" : "perimeter",
      "process" : "supervisor",
      "stateRights" : [
          {
            "state" : "disconnectedEntity",
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
    #Create new perimeter
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeter
    When method post
    Then status 201
    
    #Attach perimeter to group Dispatcher
    Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeterArray
    When method patch
    Then status 200

    * def updateConfig =
    """
    {
      "secondsBetweenConnectionChecks": 1,
      "nbOfConsecutiveNotConnectedToSendFirstCard": 2,
      "nbOfConsecutiveNotConnectedToSendSecondCard": 60
    }
    """

    # Post configuration change with non admin user should fail
    Given url 'http://localhost:2108/config'
	And header Authorization = 'Bearer ' + authTokenAsTSO
    And request updateConfig
    When method post
    Then status 403

    # Post configuration change with  admin user
    Given url 'http://localhost:2108/config'
	And header Authorization = 'Bearer ' + authTokenAdmin
    And request updateConfig
    When method post
    Then status 200

    Given url 'http://localhost:2108/start'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'Start supervisor'
    
    Given url 'http://localhost:2108/status'
    And header Authorization = 'Bearer ' + authTokenAdmin
      When method get
      Then status 200
      And match karate.toString(response) ==  'true'


    * def filter =
    """
    {
      "page" : 0,
      "size" : 10,
      "filters" : [
        {
          "columnName": "process",
          "filter" : ["supervisor"],
          "matchType": "EQUALS"
        },
        {
          "columnName": "state",
          "filter" : ["disconnectedEntity"],
          "matchType": "EQUALS"
        },
        
      ]
    }
    """

    * configure retry = { count: 15, interval: 1000 }
    Given url opfabUrl + 'cards/cards'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request filter
    And retry until responseStatus == 200 && response.numberOfElements == 1 
    Then method post
    Then status 200
    And assert response.content[0].id == 'supervisor.ENTITY2_FR'
    And assert response.content[0].titleTranslated == 'Control Center FR South disconnected'



  Scenario: Check alert card is sent when a card remains unacknowledged for the configured period

    * def perimeter_update =
    """
    {
      "id" : "perimeter",
      "process" : "supervisor",
      "stateRights" : [
        {
            "state" : "disconnectedEntity",
            "right" : "ReceiveAndWrite"
          },
          {
            "state" : "unacknowledgedCards",
            "right" : "ReceiveAndWrite"
          }
        ]
    }
    """

    #Create new perimeter
    Given url opfabUrl + 'users/perimeters/perimeter'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request perimeter_update
    When method put
    Then status 200
    


    * def updateConfig =
    """
    {
      "secondsBetweenConnectionChecks": 10,
      "nbOfConsecutiveNotConnectedToSendFirstCard": 3,
      "nbOfConsecutiveNotConnectedToSendSecondCard": 12,
      "secondsBetweenAcknowledgmentChecks": 1,
      "secondsAfterPublicationToConsiderCardAsNotAcknowledged": 2,
      "processesToSupervise": [
        { "process": "supervisor", "states": ["disconnectedEntity"] }
      ]
    }
    """

    # Post configuration change with  admin user 
    Given url 'http://localhost:2108/config'
	  And header Authorization = 'Bearer ' + authTokenAdmin
    And request updateConfig
    When method post
    Then status 200



    * def filter =
    """
    {
      "page" : 0,
      "size" : 10,
      "filters" : [
        {
          "columnName": "process",
          "filter" : ["supervisor"],
          "matchType": "EQUALS"
        },
        {
          "columnName": "state",
          "filter" : ["unacknowledgedCards"],
          "matchType": "EQUALS"
        },
        {
          "columnName": "titleTranslated",
          "filter" : ["Card Control Center FR South disconnected not acknowledged"],
          "matchType": "EQUALS"
        },
      ]
    }
    """

    * configure retry = { count: 15, interval: 1000 }
    Given url opfabUrl + 'cards/cards'
    And header Authorization = 'Bearer ' + authTokenSupervisor
    And request filter
    And retry until responseStatus == 200 && response.numberOfElements == 1 
    Then method post
    Then status 200 
    And assert response.content[0].id == 'supervisor.supervisor.ENTITY2_FR'

    * def filter =
    """
    {
      "page" : 0,
      "size" : 10,
      "filters" : [
        {
          "columnName": "process",
          "filter" : ["supervisor"],
          "matchType": "EQUALS"
        },
        {
          "columnName": "state",
          "filter" : ["unacknowledgedCards"],
          "matchType": "EQUALS"
        },
        {
          "columnName": "titleTranslated",
          "filter" : ["Card Control Center FR North disconnected not acknowledged"],
          "matchType": "EQUALS"
        },
      ]
    }
    """

    * configure retry = { count: 15, interval: 1000 }
    Given url opfabUrl + 'cards/cards'
    And header Authorization = 'Bearer ' + authTokenSupervisor
    And request filter
    And retry until responseStatus == 200 && response.numberOfElements == 1 
    Then method post
    Then status 200 
    And assert response.content[0].id == 'supervisor.supervisor.ENTITY1_FR'

Scenario: Restore

    Given url 'http://localhost:2108/stop'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method get
    Then status 200
    And match karate.toString(response) ==  'Stop supervisor'

    * def defaultConfig =
    """
    {
      "secondsBetweenConnectionChecks": 10,
      "nbOfConsecutiveNotConnectedToSendFirstCard": 3,
      "nbOfConsecutiveNotConnectedToSendSecondCard": 12,
      "windowInSecondsForCardSearch": 1200,
      "secondsBetweenAcknowledgmentChecks": 10,
      "secondsAfterPublicationToConsiderCardAsNotAcknowledged": 600,
      "processesToSupervise": [
        { "process": "messageOrQuestionExample", "states": ["messageState","questionState"]},
        { "process": "defaultProcess", "states": ["processState"] }
      ],
    }
    """
    # restore default configuration
    Given url 'http://localhost:2108/config'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And request defaultConfig
    When method post
    Then status 200


# delete perimeter created previously
  Given url opfabUrl + 'users/perimeters/perimeter'
  And header Authorization = 'Bearer ' + authTokenAdmin
  When method delete
  Then status 200