Feature: fetch user settings

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def userToFetch = 'loginKarate1'


  Scenario: Fetch user settings
    # Endpoint tested get /users/{login}/settings
    #Fetching details about the user expected response 200
    Given url opfabUrl + 'users/users/'+ userToFetch +'/settings'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: Fetch user settings without authentication
    #Fetching details about the user without authentication, expected response 401
    Given url opfabUrl + 'users/users/'+ userToFetch +'/settings'
    When method get
    Then status 401


  Scenario: Fetch user settings with a simple user
    #Fetching details about the admin user with a TSO token, expected response 403
    Given url opfabUrl + 'users/users/'+ userToFetch +'/settings'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario: fetch non-existent user
    #Fetching details about the admin user that doesn't exist, expected response 404
    Given url opfabUrl + 'users/users/fakeuser'+'/settings'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404