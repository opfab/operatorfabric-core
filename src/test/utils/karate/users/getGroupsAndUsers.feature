Feature: Users and groups


  Background:

    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken

  Scenario: Get Groups

    # Get all groups
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].name != null
    And def groupName = response[0].name

    # Get the first group
    Given url opfabUrl + 'users/groups/' +  groupName
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.name == groupName


  Scenario: Get Users

    # get all users
    Given url opfabUrl + 'users/users'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response[0].login != null
    And def login = response[0].login

    # Get the first user
    Given url opfabUrl + 'users/users/' +  login
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.login == login
