Feature: Fetch users

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def username = 'admin'


  Scenario: Fetch an existing user
    Given url opfabUrl + 'users/users/'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: fetch user details
    # Endpoint tested get /users/{login}
    Given url opfabUrl + 'users/users/' + username
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 200


  Scenario: Fetching details about an user without authentication
    Given url opfabUrl + 'users/users/' + username
    When method get
    Then status 401


  Scenario:Fetching details about the admin user with a TSO token
    #Fetching details about the admin user with a TSO token, expected response 403
    Given url opfabUrl + 'users/users/admin'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 403


  Scenario:Fetching details about an user that doesn't exist
    #Fetching details about an user that doesn't exist, expected response 404
    Given url opfabUrl + 'users/users/fakeuser'
    And header Authorization = 'Bearer ' + authToken
    When method get
    Then status 404


  Scenario:fetching details about tso1-operator
    #fetching details about tso1-operator expected response 200
    Given url opfabUrl + 'users/users/tso1-operator'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
