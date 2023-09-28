Feature: Get current user with perimeters (endpoint tested : GET /CurrentUserWithPerimeters)

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def signInAsTSO4 = callonce read('../../common/getToken.feature') { username: 'operator4_fr'}
    * def authTokenAsTSO4 = signInAsTSO4.authToken

    * def group15 =
"""
{
  "id" : "groupKarate15",
  "name" : "groupKarate15 name",
  "description" : "groupKarate15 description"
}
"""

    * def group16 =
"""
{
  "id" : "groupKarate16",
  "name" : "groupKarate16 name",
  "description" : "groupKarate16 description"
}
"""

    * def perimeter15_1 =
"""
{
  "id" : "perimeterKarate15_1",
  "process" : "process15",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "Receive",
        "filteringNotificationAllowed" : true
      },
      {
        "state" : "state2",
        "right" : "ReceiveAndWrite",
        "filteringNotificationAllowed" : true
      }
  ]
}
"""

    * def perimeter15_2 =
"""
{
  "id" : "perimeterKarate15_2",
  "process" : "process15",
  "stateRights" : [
      {
        "state" : "state1",
        "right" : "ReceiveAndWrite",
        "filteringNotificationAllowed" : true
      },
      {
        "state" : "state2",
        "right" : "Receive",
        "filteringNotificationAllowed" : false
      }
  ]
}
"""
    * def operator1Array =
"""
[   "operator1_fr"
]
"""
    * def group15Array =
"""
[   "groupKarate15"
]
"""
    * def group16Array =
"""
[   "groupKarate16"
]
"""

    * def userSettingsForTSO4 =
"""
{
  "login" : "operator4_fr",
  "entitiesDisconnected": ["ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]
}
"""

    * def userSettingsForTSO4_disconnectAllEntities =
"""
{
  "login" : "operator4_fr",
  "entitiesDisconnected": ["ENTITY1_FR", "ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]
}
"""

    * def userSettingsForTSO4_reconnectAllEntities =
"""
{
  "login" : "operator4_fr",
  "entitiesDisconnected": []
}
"""

  Scenario: Get current user with perimeters with operator1_fr
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'operator1_fr'
    And match response.userData.firstName == 'John'
    And match response.userData.lastName == 'Doe'
    And assert response.computedPerimeters.length == 0


  Scenario: get current user with perimeters without authentication
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    When method get
    Then status 401


  Scenario: Create group15
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group15
    When method post
    Then status 201
    And match response.description == group15.description
    And match response.name == group15.name
    And match response.id == group15.id


  Scenario: Create group16
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group16
    When method post
    Then status 201
    And match response.description == group16.description
    And match response.name == group16.name
    And match response.id == group16.id


  Scenario: Add operator1_fr to group15
    Given url opfabUrl + 'users/groups/' + group15.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Add operator1_fr to group16
    Given url opfabUrl + 'users/groups/' + group16.id + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request operator1Array
    When method patch
    And status 200


  Scenario: Create perimeter15_1
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_1
    When method post
    Then status 201
    And match response.id == perimeter15_1.id
    And match response.process == perimeter15_1.process
    And match response.stateRights == perimeter15_1.stateRights


  Scenario: Create perimeter15_2
    Given url opfabUrl + 'users/perimeters'
    And header Authorization = 'Bearer ' + authToken
    And request perimeter15_2
    When method post
    Then status 201
    And match response.id == perimeter15_2.id
    And match response.process == perimeter15_2.process
    And match response.stateRights == perimeter15_2.stateRights


  Scenario: Put group15 for perimeter15_1
    Given url opfabUrl + 'users/perimeters/'+ perimeter15_1.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group15Array
    When method put
    Then status 200


  Scenario: Put group16 for perimeter15_2
    Given url opfabUrl + 'users/perimeters/'+ perimeter15_2.id + '/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group16Array
    When method put
    Then status 200


  Scenario: Get current user with perimeters with operator1_fr
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
    And match response.userData.login == 'operator1_fr'
    And assert response.computedPerimeters.length == 2
    And match response.computedPerimeters contains only [{"process":"process15","state":"state1","rights":"ReceiveAndWrite","filteringNotificationAllowed":true}, {"process":"process15","state":"state2","rights":"ReceiveAndWrite","filteringNotificationAllowed":false}]


  Scenario: Delete user operator1_fr from group15
    Given url opfabUrl + 'users/groups/' + group15.id  + '/users/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Delete user operator1_fr from group16
    Given url opfabUrl + 'users/groups/' + group16.id  + '/users/operator1_fr'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

  Scenario: Get current user with perimeters with operator4_fr
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    When method get
    Then status 200
    And match response.userData.login == 'operator4_fr'
    And assert response.computedPerimeters.length == 0
    And assert response.userData.entities.length == 5
    And match response.userData.entities contains only ["ENTITY_FR", "ENTITY1_FR", "ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]

  Scenario: Patch operator4_fr user settings
    Given url opfabUrl + 'users/users/operator4_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    And request userSettingsForTSO4
    When method patch
    Then status 200
    And match response.login == 'operator4_fr'
    And assert response.entitiesDisconnected.length == 3
    And match response.entitiesDisconnected contains only ["ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]

  Scenario: We check operator4_fr's entities are updated
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    When method get
    Then status 200
    And match response.userData.login == 'operator4_fr'
    And assert response.computedPerimeters.length == 0
    And assert response.userData.entities.length == 2
    And match response.userData.entities contains only ["ENTITY_FR", "ENTITY1_FR"]

  Scenario: Patch operator4_fr user settings (we disconnect all entities)
    Given url opfabUrl + 'users/users/operator4_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    And request userSettingsForTSO4_disconnectAllEntities
    When method patch
    Then status 200
    And match response.login == 'operator4_fr'
    And assert response.entitiesDisconnected.length == 4
    And match response.entitiesDisconnected contains only ["ENTITY1_FR", "ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]

  Scenario: We check entities list of operator4_fr is empty (even the parent entity "ENTITY_FR" should not be present)
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    When method get
    Then status 200
    And match response.userData.login == 'operator4_fr'
    And assert response.computedPerimeters.length == 0
    And assert response.userData.entities.length == 0

  Scenario: Patch operator4_fr user settings (we reconnect all entities)
    Given url opfabUrl + 'users/users/operator4_fr/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    And request userSettingsForTSO4_reconnectAllEntities
    When method patch
    Then status 200
    And match response.login == 'operator4_fr'
    And match response.entitiesDisconnected == '#notpresent'

  Scenario: We check entities list of operator4_fr contains all entities again
    Given url opfabUrl + 'users/CurrentUserWithPerimeters'
    And header Authorization = 'Bearer ' + authTokenAsTSO4
    When method get
    Then status 200
    And match response.userData.login == 'operator4_fr'
    And assert response.computedPerimeters.length == 0
    And assert response.userData.entities.length == 5
    And match response.userData.entities contains only ["ENTITY_FR", "ENTITY1_FR", "ENTITY2_FR", "ENTITY3_FR", "ENTITY4_FR"]