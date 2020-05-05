Feature: Update existing group

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

           #defining groups
    * def groupUpdated =
"""
{
  "id" : "groupKarate1",
  "description" : "group description updated"
}
"""

    * def groupError =
"""
{
  "virtualField" : "virtual"
}
"""

  Scenario: Update the group
    #Update the group, expected response 200
    Given url opfabUrl + 'users/groups/' + groupUpdated.id
    And header Authorization = 'Bearer ' + authToken
    And request groupUpdated
    When method put
    Then status 200

  Scenario: Without authentication
    # authentication required, response expected 401
    Given url opfabUrl + 'users/groups/' + groupUpdated.id
    And request groupUpdated
    When method put
    Then status 401

  Scenario: With a simple user
    # update Group wrong user response expected 403
    Given url opfabUrl + 'users/groups/' + groupUpdated.id
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request groupUpdated
    When method put
    Then status 403

  Scenario: error 400
    Given url opfabUrl + 'users/groups/' + groupUpdated.id
    And header Authorization = 'Bearer ' + authToken
    And request groupError
    When method put
    Then status 400


