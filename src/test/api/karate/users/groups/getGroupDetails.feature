Feature: Get Group details

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining groups
    * def group =
"""
{
  "id" : "groupKarate3",
  "name" : "groupKarate3 name",
  "description" : "groupKarate3 description"
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
    #get /groups/{id}
    Given url opfabUrl + 'users/groups/' + group.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then match response.id == group.id
    And match response.description == group.description
    And match response.name == group.name
    And status 200


  Scenario: get group details without authentication
    Given url opfabUrl + 'users/groups/' + group.id
    When method get
    Then status 401


  Scenario: get group details with a simple user
    Given url opfabUrl + 'users/groups/' + group.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: get nonexistent group details
    Given url opfabUrl + 'users/groups/Random'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404