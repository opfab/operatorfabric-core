Feature: deleteGroup

  Background:
   #Getting token for admin and operator1 user calling getToken.feature
    * def signIn = callonce read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../../common/getToken.feature') { username: 'operator1'}
    * def authTokenAsTSO = signInAsTSO.authToken


    # defining group to create
    * def groupForEndpointDeleteGroup =
"""
{
   "id" : "groupForEndpointDeleteGroup",
   "name" : "groupForEndpointDeleteGroup name",
   "description" : "groupForEndpointDeleteGroup description"
}
"""


  Scenario: Delete group for a non-existent group, expected response 404
    Given url opfabUrl + 'users/groups/NonExistentGroup'
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 404


  # then we create a new group who will be deleted
  Scenario: create a new group
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    And request groupForEndpointDeleteGroup
    When method post
    Then status 201
    And match response.id == groupForEndpointDeleteGroup.id
    And match response.name == groupForEndpointDeleteGroup.name
    And match response.description == groupForEndpointDeleteGroup.description


  Scenario: we check that the group created previously exists
    Given url opfabUrl + 'users/groups/' + groupForEndpointDeleteGroup.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: delete group with no authentication, expected response 401
    Given url opfabUrl + 'users/groups/' + groupForEndpointDeleteGroup.id
    When method delete
    Then status 401


  Scenario: delete group with no admin authentication (with operator1 authentication), expected response 403
    Given url opfabUrl + 'users/groups/' + groupForEndpointDeleteGroup.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403


  Scenario: delete group (with admin authentication), expected response 200
    Given url opfabUrl + 'users/groups/' + groupForEndpointDeleteGroup.id
    And header Authorization = 'Bearer ' + authToken
    When method delete
    Then status 200


  Scenario: we check that the group doesn't exist anymore, expected response 404
    Given url opfabUrl + 'users/groups/' + groupForEndpointDeleteGroup.id
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404