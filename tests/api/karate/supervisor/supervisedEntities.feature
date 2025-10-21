Feature: Supervisor configuration


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def signInSupervisor = callonce read('../common/getToken.feature') { username: 'opfab'}
    * def authTokenSupervisor = signInSupervisor.authToken



Scenario: Get supervised entities

    # Get supervied entities with non admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403

    # Get supervied entities with  admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    When method get
    Then status 200
    And assert response.length == 2


  Scenario: Add supervised entity 


    * def supervisorConfig =
    """
    {
      "entityId": "ENTITY3_FR",
      "supervisors":["ENTITY2_FR"]
    }
    """

    * def updateConfig =
    """
    {
      "entityId": "ENTITY3_FR",
      "supervisors":["ENTITY2_FR","ENTITY4_FR"]
    }
    """

    # Post supervised entity with non admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
    And request supervisorConfig
    When method post
    Then status 403

    # Post supervised entity  with  admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    And request supervisorConfig
    When method post
    Then status 200

    # Get supervised entities with  admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    When method get
    Then status 200
    And assert response.length == 3
    And match response[2].entityId == 'ENTITY3_FR'
    And match response[2].supervisors[0] == 'ENTITY2_FR'

    # Update supervised entity with admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    And request updateConfig
    When method post
    Then status 200


    # Get supervised entities with  admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    When method get
    Then status 200
    And assert response.length == 3
    And match response[2].entityId == 'ENTITY3_FR'
    And match response[2].supervisors[0] == 'ENTITY2_FR'
    And match response[2].supervisors[1] == 'ENTITY4_FR'


    # Delete supervised entity with non admin user 
    Given url 'http://localhost:2108/supervisedEntities/ENTITY3_FR'
	  And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

    # Delete supervised entity with  admin user 
    Given url 'http://localhost:2108/supervisedEntities/ENTITY3_FR'
	  And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200

    # Get supervised entities with  admin user 
    Given url 'http://localhost:2108/supervisedEntities'
	  And header Authorization = 'Bearer ' + authTokenSupervisor
    When method get
    Then status 200
    And assert response.length == 2