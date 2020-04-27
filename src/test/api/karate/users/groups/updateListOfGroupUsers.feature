Feature: Update list of group users

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken

       #defining groups
    * def group = 'groupKarate1'


    # defining users to create
    # defining users to create
    * def userKarate3 =
"""
{
   "login" : "loginKarate3",
   "firstName" : "name3",
   "lastName" : "familyName3"
}
"""

    * def userKarate4 =
"""
{
   "login" : "loginKarate4",
   "firstName" : "name4",
   "lastName" : "familyName4"
}
"""

    * def userKarate6 =
"""
{
   "login" : "loginKarate6",
   "firstName" : "name6",
   "lastName" : "familyName6"
}
"""

    * def userKarate6List =
"""
[
"loginKarate6"
]
"""

    * def userList =
"""
[
"loginKarate3", "loginKarate4"
]
"""

  Scenario: Create userKarate3
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate3
    When method post
    Then status 201
    And match response.login == userKarate3.login
    And match response.firstName == userKarate3.firstName
    And match response.lastName == userKarate3.lastName


  Scenario: Create userKarate4
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate4
    When method post
    Then status 201
    And match response.login == userKarate4.login
    And match response.firstName == userKarate4.firstName
    And match response.lastName == userKarate4.lastName


  Scenario: Create userKarate6
    #post /users
    #create new user, expected response 201
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate6
    When method post
    Then status 201
    And match response.login == userKarate6.login
    And match response.firstName == userKarate6.firstName
    And match response.lastName == userKarate6.lastName


  Scenario: Add userKarate6 to the group
    Given url opfabUrl + 'users/groups/' + group + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request userKarate6List
    When method patch
    And status 200


  Scenario: Check that userKarate6 belongs to the group
    Given url opfabUrl + 'users/users/' + userKarate6.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.groups[0] == group


  Scenario: Update list of group users without authentication
    Given url opfabUrl + 'users/groups/'+ group + '/users'
    And request userList
    When method put
    Then status 401


  Scenario: Update list of group users with user other than admin
    Given url opfabUrl + 'users/groups/'+ group + '/users'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userList
    When method put
    Then status 403


  Scenario: Update list of and nonexistent group
    Given url opfabUrl + 'users/groups/fake/users'
    And header Authorization = 'Bearer ' + authToken
    And request userList
    When method put
    Then status 404


  #Endpoints tested put /groups/{name}/users
  Scenario: Update list of group users
    Given url opfabUrl + 'users/groups/'+ group + '/users'
    And header Authorization = 'Bearer ' + authToken
    And request userList
    When method put
    Then status 200


  Scenario: Check that userKarate3 belongs to the group
    Given url opfabUrl + 'users/users/' + userKarate3.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.groups[0] == group


  Scenario: Check that userKarate4 belongs to the group
    Given url opfabUrl + 'users/users/' + userKarate4.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.groups[0] == group


  Scenario: Check that userKarate6 no longer belongs to the group
    Given url opfabUrl + 'users/users/' + userKarate6.login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And assert response.groups.length == 0