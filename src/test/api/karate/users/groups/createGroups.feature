Feature: CreateGroups

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
      #defining groups
    * def group =
"""
{

  "name" : "groupKarate1",
  "description" : "Karate is driving me crazy"
}
"""
    * def groupUpdated =
"""
{

  "name" : "groupKarate1",
  "description" : "I Love Karate"
}
"""
    * def wrongGroup =
"""
{
  "description" : "Karate is driving me crazy",
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

  Scenario: Update my group

#Expected response 200
    Given url opfabUrl + 'users/groups/'
    And header Authorization = 'Bearer ' + authToken
    And request groupUpdated
    When method post
    Then status 200
    And match response.description == groupUpdated.description
    And match response.name == groupUpdated.name

  Scenario: create without admin role
        #HForbiden without admin role, expected response 403
    Given url opfabUrl + 'users/groups/' + group.name
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request group
    When method post
    Then status 403

     Scenario: Update without authentication token
     #Witout authentication
    Given url opfabUrl + 'users/groups/' + group.name
    And request group
    When method post
   Then status 401

  Scenario: error 400

#Create new group (check if the group already exists otherwise it will return 200)
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request wrongGroup
    When method post
    Then status 400

