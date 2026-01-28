Feature: Send card when an email is received

  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAsAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAsAdmin = signInAsAdmin.authToken


    * def filter =
      """
      {
        "page" : 0,
        "size" : 10,
        "filters" : [
          {
            "columnName": "processInstanceId",
            "filter" : ["emailToCardTest"],
            "matchType": "EQUALS"
          }
        ]
      }
      """

    * def perimeterKarateForEmailToCard =
      """
      {
        "id" : "perimeterKarateForEmailToCard",
        "process" : "api_test",
        "stateRights" : [
          {
            "state" : "messageState",
            "right" : "ReceiveAndWrite",
            "filteringNotificationAllowed" : true
          }
        ]
      }
      """

    * def groupKarateForEmailToCard =
      """
      {
        "id" : "groupKarateForEmailToCard",
        "name" : "groupKarateForEmailToCard name",
        "description" : "groupKarateForEmailToCard description"
      }
      """

    * def groupKarateForEmailToCardList =
      """
      [
        "groupKarateForEmailToCard"
      ]
      """

    * def userOpfab =
      """
      [
        "opfab", "operator1_fr"
      ]
      """


  Scenario: Create Perimeter perimeterKarateForEmailToCard
    Given def result = callonce read('../common/createPerimeter.feature') {perimeter: '#(perimeterKarateForEmailToCard)', token: '#(authTokenAsAdmin)'}
    Then match result.response.id == perimeterKarateForEmailToCard.id
    And match result.response.process == perimeterKarateForEmailToCard.process
    And match result.response.stateRights == perimeterKarateForEmailToCard.stateRights


  Scenario: Create groupKarateForEmailToCard
    Given def result = callonce read('../common/createGroup.feature') {group: '#(groupKarateForEmailToCard)', token: '#(authTokenAsAdmin)'}
    Then match result.response.id == groupKarateForEmailToCard.id
    And match result.response.name == groupKarateForEmailToCard.name
    And match result.response.description == groupKarateForEmailToCard.description


  Scenario: Add groupKarateForEmailToCard to the perimeter perimeterKarateForEmailToCard
    Given url opfabUrl + 'users/perimeters/perimeterKarateForEmailToCard/groups'
    And header Authorization = 'Bearer ' + authTokenAsAdmin
    And request groupKarateForEmailToCardList
    When method patch
    And status 200


  Scenario: Add user opfab and operator1_fr to the group groupKarateForEmailToCard
    Given url opfabUrl + 'users/groups/groupKarateForEmailToCard/users'
    And header Authorization = 'Bearer ' + authTokenAsAdmin
    And request userOpfab
    When method patch
    And status 200


  Scenario: Post file converter needed for operator1_fr
    Given url 'http://localhost:2109/upload'
    And header Authorization = 'Bearer ' + authTokenAsAdmin
    And multipart file file = { read: 'resources/emailToCardConverter1.js' }
    When method post
    Then status 200


  Scenario: Sending an email should trigger the sending of a card
    * def mailContent =
      """
'From: test@test.com\n' +
'To: operator1@test.com\n' +
'Subject: Test\n' +
'MIME-Version: 1.0\n' +
'Content-Type: multipart/mixed; boundary="boundary123"\n\n' +

'--boundary123\n' +
'Content-Type: text/plain; charset="utf-8"\n\n' +

'Hello,\n' +
'please find attachment.\n\n' +

'--boundary123\n' +
'Content-Type: text/plain; charset="utf-8"\n' +
'Content-Disposition: attachment; filename="first-attachment.txt"\n\n' +

'This is the content of the first attachment.\n' +
'Line 2 of first attachment.\n\n' +

'--boundary123\n' +
'Content-Type: text/plain; charset="utf-8"\n' +
'Content-Disposition: attachment; filename="second-attachment.txt"\n\n' +

'This is the content of the second attachment.\n' +
'Line 2 of second attachment.\n\n' +

'--boundary123--\n'
      """

    # Write the email to a file and get the absolute path
    * def emailFile = karate.write(mailContent, 'tempEmail.txt')
    * def cmd = 'curl --silent --show-error --url smtp://localhost:3025 --mail-from test@test.com --mail-rcpt operator1@test.com --upload-file ' + emailFile
    * def result = karate.exec(cmd)

    # Delete the temporary email file
    * karate.exec('rm -f ' + emailFile)


    * configure retry = { count: 20, interval: 1000 }
    Given url opfabUrl + 'cards-consultation/cards/api_test.emailToCardTest'
    And header Authorization = 'Bearer ' + authToken
    And retry until responseStatus == 200
    When method get
    Then status 200
    And match response.card.processInstanceId == 'emailToCardTest'
    And match response.card.process == 'api_test'
    And match response.card.state == 'messageState'
    And match response.card.data.content.from == 'test@test.com'
    And match response.card.data.content.to[0] == 'operator1@test.com'
    And match response.card.data.content.subject == 'Test'
    And match response.card.data.content.body == 'Hello,\nplease find attachment.'
    And match response.card.data.content.attachments[0].filename == 'first-attachment.txt'
    And match response.card.data.content.attachments[0].content == 'This is the content of the first attachment.\nLine 2 of first attachment.\n'
    And match response.card.data.content.attachments[1].filename == 'second-attachment.txt'
    And match response.card.data.content.attachments[1].content == 'This is the content of the second attachment.\nLine 2 of second attachment.\n'


  Scenario: Delete card
    Given url opfabPublishCardUrl + 'cards/api_test.emailToCardTest'
    And header Authorization = 'Bearer ' + authTokenAsAdmin
    When method delete
    Then status 200


    # Check card was deleted
    * configure retry = { count: 5, interval: 1000 }
    Given url opfabUrl + 'cards-consultation/cards/api_test.emailToCardTest'
    And header Authorization = 'Bearer ' + authToken
    And retry until responseStatus == 404


  Scenario: Delete perimeter perimeterKarateForEmailToCard created previously
    * callonce read('../common/deletePerimeter.feature') {perimeterId: '#(perimeterKarateForEmailToCard.id)', token: '#(authTokenAsAdmin)'}


  Scenario: Delete groupKarateForEmailToCard created previously
    * callonce read('../common/deleteGroup.feature') { groupId: '#(groupKarateForEmailToCard.id)', token: '#(authTokenAsAdmin)'}


  Scenario: Delete file converter previously uploaded
    Given url 'http://localhost:2109/delete' + '?filename=emailToCardConverter1.js'
    And header Authorization = 'Bearer ' + authTokenAsAdmin
    When method delete
    Then status 200


  Scenario: Purge all emails from GreenMail
    Given url 'http://localhost:8080/api/mail/purge'
    When method post
    Then assert responseStatus == 204 || responseStatus == 200
