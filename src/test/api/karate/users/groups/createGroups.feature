Feature: CreateGroups

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
      #defining groups
    * def group =
"""
{
  "id" : "groupKarate1",
  "name" : "groupKarate1 name",
  "description" : "Karate is driving me crazy"
}
"""
    * def groupUpdated =
"""
{

  "id" : "groupKarate1",
  "name" : "groupKarate1 name",
  "description" : "I Love Karate",
  "realtime" : false
}
"""
    * def wrongGroup =
"""
{
  "description" : "Karate is driving me crazy",
}
"""
  * def wrongPerimeterGroup =
  """
  {
  
    "id" : "groupKaratePerimeter1",
    "name" : "groupKarate with perimeter name",
    "description" : "I Love Karate",
    "perimeters" : ['wrongPerimter']
  }
  """

  Scenario: Create Groups

#Create new group (check if the group already exists otherwise it will return 200)
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group
    When method post
    Then status 201
    And match response.description == group.description
    And match response.name == group.name
    And match response.id == group.id
    And match response.realtime == null

  Scenario: Update my group

#Expected response 200
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupUpdated
    When method post
    Then status 200
    And match response.description == groupUpdated.description
    And match response.name == groupUpdated.name
    And match response.id == groupUpdated.id
    And match response.realtime == groupUpdated.realtime

  Scenario: create without admin role
#Forbidden without admin role, expected response 403
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request group
    When method post
    Then status 403

  Scenario: Update without authentication token
#Without authentication
    Given url opfabUrl + 'users/groups'
    And request group
    When method post
    Then status 401

  Scenario: error 400

#Create bad group 
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongGroup
    When method post
    Then status 400

  Scenario: Create with wrong perimeter error 
    
#create group with wrong perimeter
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongPerimeterGroup
    When method post
    Then status 400
