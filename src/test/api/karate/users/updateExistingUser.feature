Feature: Update existing user

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def userToUpdate = "loginkarate5"


    * def userNew =
"""
{
  "login" : "loginkarate5",
  "firstName" : "name",
  "lastName" : "last name"
}
"""

    * def userUpdate =
"""
{
  "login" : "loginkarate5",
  "firstName" : "name update Karate5",
  "lastName" : "last name update Karate5",
  "comment" : "comment Karate5",
  "authorizedIPAddresses" : ['127.0.0.1','192.168.0.1']
}
"""

    * def fakeUser =
"""
{
  "fake" : "newuser"
}
"""
    #Endpoint tested put /users/{login}

  Scenario: update an existing user without authentication

    Given url opfabUrl + 'users/users/' + userToUpdate
    And request userUpdate
    When method put
    Then status 401


  Scenario: update an existing user without admin authentication

    Given url opfabUrl + 'users/users/' + userToUpdate
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And request userUpdate
    When method put
    Then status 403


  Scenario: update an existing user with a bad format request

    Given url opfabUrl + 'users/users/' + userToUpdate
    And header Authorization = 'Bearer ' + authToken
    And request fakeUser
    When method put
    Then status 400


  Scenario: create a new user

    Given url opfabUrl + 'users/users/' + userNew.login
    And header Authorization = 'Bearer ' + authToken
    And request userNew
    When method put
    Then status 201
    And match response.login == userNew.login
    And match response.firstName == userNew.firstName
    And match response.lastName == userNew.lastName


  Scenario: update an existing user

    Given url opfabUrl + 'users/users/' + userToUpdate
    And header Authorization = 'Bearer ' + authToken
    And request userUpdate
    When method put
    Then status 200
    And match response.login == userUpdate.login
    And match response.firstName == userUpdate.firstName
    And match response.lastName == userUpdate.lastName
    And match response.comment == userUpdate.comment
    And match response.authorizedIPAddresses contains '127.0.0.1'
    And match response.authorizedIPAddresses contains '192.168.0.1'

    