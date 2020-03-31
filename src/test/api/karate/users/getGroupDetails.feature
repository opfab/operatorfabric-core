Feature: Get Group details

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining groups
    * def group =
"""
{
  "name" : "groupKarate3",
  "description" : "group"
}
"""


    #Create the group first
  Scenario: Create the group
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request group
    When method post
    Then status 201


  Scenario: get group details
    #get /groups/{name}
    Given url opfabUrl + 'users/groups/' + group.name
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then match response.name == group.name
    And match response.description == group.description
    And status 200


  Scenario: get group details without authentication
    Given url opfabUrl + 'users/groups/' + group.name
    When method get
    Then status 401


  Scenario: get group details with a simple user
    Given url opfabUrl + 'users/groups/' + group.name
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get nonexistent group details
    Given url opfabUrl + 'users/groups/Random'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404