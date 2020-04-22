Feature: Get Groups

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken


  Scenario: Get Groups
    #  get /groups
    # Get all groups
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And print response
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


  Scenario: get groups without authentication
    # Get all groups, authentication required response expected 401
    Given url opfabUrl + 'users/groups'
    When method get
    Then status 401


  Scenario: get groups with simple user
    #   Using TSO user,  expected response 403
    Given url opfabUrl + 'users/groups'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403