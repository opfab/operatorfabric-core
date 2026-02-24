Feature: uploadUIMenu

  Background:
    # Get admin token
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin' }
    * def authToken = signIn.authToken

    # Get TSO-operator
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr' }
    * def authTokenAsTSO = signInAsTSO.authToken

  Scenario: Post UIMenu file without authentication
    Given url opfabUrl + '/businessconfig/uimenu'
    And multipart file file = { read: 'resources/uimenu.json' }
    When method post
    And status 401

  Scenario: Post UIMenu file without admin role
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    And multipart file file = { read: 'resources/uimenu.json' }
    When method post
    And status 403

  Scenario: Post valid UIMenu file
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authToken
    And multipart file file = { read: 'resources/uimenu.json' }
    When method post
    And status 201

  Scenario: Check that UIMenu has been updated
    Given url opfabUrl + '/businessconfig/uimenu'
    And header Authorization = 'Bearer ' + authTokenAsTSO
    When method GET
    Then status 200
    And assert response.navigationBar.length > 0
    And assert response.topRightIconMenus.length > 0
    And assert response.topRightMenus.length > 0
    And assert response.locales.length == 3
    Then match response.locales[0].language == 'en'
    Then match response.locales[0].localizedContent.title.single == 'First menu'
    Then match response.locales[0].localizedContent.entry.single == 'Single menu entry'
    Then match response.locales[1].language == 'fr'
    Then match response.locales[1].localizedContent.title.single == 'Premier menu'
    Then match response.locales[1].localizedContent.entry.single == 'Unique élément'
    Then match response.locales[2].language == 'nl'
    Then match response.locales[2].localizedContent.title.single == 'Eerste menu'
    Then match response.locales[2].localizedContent.entry.single == 'Enkel menu-item'


