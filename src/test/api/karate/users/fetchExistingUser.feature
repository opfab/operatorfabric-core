Feature: Fetch users

  Background:
   #Getting token for admin and operator1_fr user calling getToken.feature
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def username = 'admin'


  Scenario: Fetch an existing user
    Given url opfabUrl + 'users/users'
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


  Scenario:fetching details about operator1_fr
    #fetching details about operator1_fr expected response 200
    Given url opfabUrl + 'users/users/operator1_fr'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method get
    Then status 200
