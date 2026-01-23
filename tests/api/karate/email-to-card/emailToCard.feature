Feature: EmailToCard


  Background:

    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def signInSupervisor = callonce read('../common/getToken.feature') { username: 'opfab'}
    * def authTokenSupervisor = signInSupervisor.authToken

  Scenario: healthcheck API
    # Call healthcheck API without authentication
    Given url 'http://localhost:2109/healthcheck'
    When method get
    Then status 200


  Scenario: Check there is no file uploaded
    # Get files with non admin user should fail
    Given url 'http://localhost:2109/list'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 403

    Given url 'http://localhost:2109/list'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method GET
    Then status 200
    And assert response.files.length == 0


  Scenario: Post file
    # Post file with non admin user should fail
    Given url 'http://localhost:2109/upload'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = { read: 'resources/emailToCardConverter1.js' }
    When method post
    Then status 403

    # Post file with  admin user
    Given url 'http://localhost:2109/upload'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And multipart file file = { read: 'resources/emailToCardConverter1.js' }
    When method post
    Then status 200

    # Post file with  admin user
    Given url 'http://localhost:2109/upload'
    And header Authorization = 'Bearer ' + authTokenAdmin
    And multipart file file = { read: 'resources/emailToCardConverter2.js' }
    When method post
    Then status 200


  Scenario: Check there is 2 files uploaded
    Given url 'http://localhost:2109/list'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method GET
    Then status 200
    And assert response.files.length == 2
    Then match response.files[0] == 'emailToCardConverter1.js'
    Then match response.files[1] == 'emailToCardConverter2.js'


  Scenario: Delete file uploaded
    # Delete file with non admin user should fail
    Given url 'http://localhost:2109/delete' + '?filename=emailToCardConverter1.js'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method delete
    Then status 403

    Given url 'http://localhost:2109/delete' + '?filename=emailToCardConverter1.js'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200

    Given url 'http://localhost:2109/delete' + '?filename=emailToCardConverter2.js'
    And header Authorization = 'Bearer ' + authTokenAdmin
    When method delete
    Then status 200