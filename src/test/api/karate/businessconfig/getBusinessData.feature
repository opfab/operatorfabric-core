Feature: deleteBusinessData

  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken   
    # User without the admin rights shouldn't be able to post
    * def signInAsTSO = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authTokenAsTSO = signInAsTSO.authToken

    Scenario: post file with wrong format
      Given url opfabUrl + 'businessconfig/businessData/businessdata'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = { read: 'resources/businessdatawrongformat.json' }
      When method POST
      Then status 400

    Scenario: post file with wrong authentication
      Given url opfabUrl + 'businessconfig/businessData/businessdata'
      And header Authorization = 'Bearer ' + authTokenAsTSO
      And multipart file file = { read: 'resources/businessdata' }
      When method POST
      Then status 403

    Scenario: post dummy file
      Given url opfabUrl + 'businessconfig/businessData/businessdata'
      And header Authorization = 'Bearer ' + authToken
      And multipart file file = { read: 'resources/businessdata' }
      When method POST
      Then status 201

    Scenario: get dummy file
      Given url opfabUrl + 'businessconfig/businessData/businessdata'
      And header Authorization = 'Bearer ' + authToken
      When method GET
      Then status 200
      And match response == {"dummy": []}

    
    Scenario: delete dummy file
      Given url opfabUrl + 'businessconfig/businessData/businessdata'
      And header Authorization = 'Bearer ' + authToken
      When method DELETE
      Then status 204

