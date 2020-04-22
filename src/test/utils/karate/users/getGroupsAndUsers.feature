Feature: Users and groups


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: Get all groups - Get the first group - Get the perimeters of the first group

    # Get all groups
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].id != null
    And def groupId = response[0].id
    And def groupName = response[0].name
    And def groupDescription = response[0].description
    And def groupPerimeters = response[0].perimeters

    # Get the first group
    Given url opfabUrl + 'users/groups/' +  groupId
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.id == groupId
    And match response.name == groupName
    And match response.description == groupDescription
    And match response.perimeters == groupPerimeters

     # Get the perimeters of the first group
    Given url opfabUrl + 'users/groups/' +  groupId + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: Get all users - Get the first user - Get the perimeters of the first user

    # get all users
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].login != null
    And def login = response[0].login
    And def firstName = response[0].firstName
    And def lastName = response[0].lastName
    And def entities = response[0].entities
    And def groups = response[0].groups

    # Get the first user
    Given url opfabUrl + 'users/users/' +  login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.login == login
    And match response.firstName == firstName
    And match response.lastName == lastName
    And match response.entities == entities
    And match response.groups == groups

    # Get the perimeters of the first user
    Given url opfabUrl + 'users/users/' +  login + '/perimeters'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200