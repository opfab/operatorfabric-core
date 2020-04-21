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
    #And match response[0].name != null
    And def groupName = response[0].name


    # Get the first group
    Given url opfabUrl + 'users/groups/' +  groupName
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200
    And match response.name == groupName


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