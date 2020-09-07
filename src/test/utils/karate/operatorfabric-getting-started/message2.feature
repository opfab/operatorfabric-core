Feature: Message with two different bundle versions

  Background:
    # Get admin token
    * def signIn = call read('../common/getToken.feature') { username: 'admin'}
    * def authToken = signIn.authToken


  Scenario: Post Bundles

    # Push bundle message version 2
    Given url opfabUrl + 'businessconfig/processes/'
    And header Authorization = 'Bearer ' + authToken
    And multipart field file = read('resources/bundles/bundle_message_v2.tar.gz')
    When method post
    Then status 201

    # Post card example 2
    * def card = read("resources/cards/card_example2.json")


    Given url opfabPublishCardUrl + 'cards'
    And request card
    When method post
    Then status 201
    And match response.count == 1
