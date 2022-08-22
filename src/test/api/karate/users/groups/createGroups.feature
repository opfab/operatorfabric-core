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
  "realtime" : false,
  "type" : "ROLE"
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

    * def groupToTestBadRequest0 =
"""
{
   "id" : "",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupToTestBadRequest1 =
"""
{
   "id" : "a",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupToTestBadRequest2 =
"""
{
   "id" : "aé",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupToTestBadRequest3 =
"""
{
   "id" : "é",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupWithValidIdFormat0 =
"""
{
   "id" : "validId",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupWithValidIdFormat1 =
"""
{
   "id" : "valid_id",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupWithValidIdFormat2 =
"""
{
   "id" : "valid-id",
   "name" : "group name",
   "description" : "group description"
}
"""

    * def groupWithValidIdFormat3 =
"""
{
   "id" : "validId_with-digit_0",
   "name" : "group name",
   "description" : "group description"
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
    And match response.realtime == false
    And match response.type == '#notpresent'

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
    And match response.type == groupUpdated.type

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


  Scenario Outline: Bad request
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request <groupToTestBadRequest>
    When method post
    Then status 400
    And match response.status == "BAD_REQUEST"
    And match response.message == <expectedMessage>

    Examples:
      | groupToTestBadRequest  | expectedMessage                                                                                                            |
      | groupToTestBadRequest0 | "Id is required."                                                                                                           |
      | groupToTestBadRequest1 | "Id should be minimum 2 characters (id=a)."                                                                                 |
      | groupToTestBadRequest2 | "Id should only contain the following characters: letters, _, - or digits (id=aé)."                                         |
      | groupToTestBadRequest3 | "Id should be minimum 2 characters (id=é).Id should only contain the following characters: letters, _, - or digits (id=é)." |


  Scenario Outline: Create group with valid id format
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request <groupWithValidIdFormat>
    When method post
    Then status 201
    And match response.id == <expectedGroupId>

    Examples:
      | groupWithValidIdFormat  | expectedGroupId            |
      | groupWithValidIdFormat0 | groupWithValidIdFormat0.id |
      | groupWithValidIdFormat1 | groupWithValidIdFormat1.id |
      | groupWithValidIdFormat2 | groupWithValidIdFormat2.id |
      | groupWithValidIdFormat3 | groupWithValidIdFormat3.id |


  Scenario Outline: we delete the groups previously created
    Given url opfabUrl + 'users/groups/' + <groupId>
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200

    Examples:
      | groupId  |
      | groupWithValidIdFormat0.id |
      | groupWithValidIdFormat1.id |
      | groupWithValidIdFormat2.id |
      | groupWithValidIdFormat3.id |
