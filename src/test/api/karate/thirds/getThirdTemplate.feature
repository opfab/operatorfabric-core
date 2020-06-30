Feature: getThirdTemplate

  Background:
   #Getting token for admin and tso1-operator user calling getToken.feature
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken
    * def signInAsTSO = call read('../common/getToken.feature') { username: 'tso1-operator'}
    * def authTokenAsTSO = signInAsTSO.authToken
    * def process = 'api_test'
    * def templateName = 'template'
    * def templateVersion = 2
    * def templateLanguage = 'en'


Scenario: Check template

    # Check template
Given url opfabUrl + '/thirds/processes/'+ process +'/templates/' + templateName + '?locale=' + templateLanguage + '&version='+ templateVersion
And header Authorization = 'Bearer ' + authToken
When method GET
Then status 200
And print response
And match response contains '{{card.data.message}}'


  Scenario: Check template without authentication

    # Check template
    Given url opfabUrl + '/thirds/processes/'+ process +'/templates/' + templateName + '?locale=' + templateLanguage + '&version='+ templateVersion
    When method GET
    Then status 401

  Scenario: Check wrong version template

    # Check template
    Given url opfabUrl + '/thirds/processes/'+ process +'/templates/' + templateName + '?locale=' + templateLanguage + '&version=99999'
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404
    And print response


  Scenario: Check wrong language

    # Check template
    Given url opfabUrl + '/thirds/processes/'+ process +'/templates/' + templateName + '?locale=DE'+'&version='+ templateVersion
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404
    And print response

  Scenario: Check wrong Template

    Given url opfabUrl + '/thirds/processes/'+ process + '/templates/nonExistentTemplate?locale=' + templateLanguage + '&version='+ templateVersion
    And header Authorization = 'Bearer ' + authToken
    When method GET
    Then status 404
    And print response
