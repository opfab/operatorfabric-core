Feature: Kafka Producer and Consumer Demo

  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def KafkaConsumer = Java.type('org.opfab.kafka.OpfabKafkaConsumer')
    * def response_topic = 'opfab-response'
    * def kafkaServer = '127.0.0.1:9092'


  * def perimeter =
    """
    {
      "id": "perimeter",
      "process": "api_test",
      "stateRights": [
        {
          "state": "messageState",
          "right": "ReceiveAndWrite"
        }
      ]
    }
    """

  * def perimeterArray =
    """
    [ "perimeter" ]
    """
    
  Scenario: Post card with attribute externalRecipients

    # Create new perimeter
  * callonce read('../common/createPerimeter.feature') { perimeter: '#(perimeter)', token: '#(authTokenAdmin)' }

  # Attach perimeter to group
  Given url opfabUrl + 'users/groups/Dispatcher/perimeters'
  And header Authorization = 'Bearer ' + authTokenAdmin
  And request perimeterArray
  When method patch
  Then status 200

  * def card =
    """
    {
	    "publisher" : "ENTITY1_FR",
      "processVersion": "1",
      "process": "api_test",
      "processInstanceId": "process.kafka.2",
      "state": "messageState",
      "groupRecipients": ["Dispatcher"],
      "externalRecipients": ["api_test_externalRecipient2"],
      "severity": "INFORMATION",
      "startDate": 1553186770681,
      "summary": {"key": "message.summary"},
      "title": {"key": "message.title"},
      "data": {"message": "test externalRecipients"}
    }
    """

    * def kc = new KafkaConsumer(response_topic, kafkaServer)

    # Push card
    Given url opfabPublishCardUrl + 'cards/userCard'
    And header Authorization = 'Bearer ' + authToken
    And request card
    When method post
    Then status 201


    # Read from the consumer
    * json out = kc.poll(5000)

    * kc.close()

    # Match
    * match out.key == "api_test"
    * match out.value.command == "RESPONSE_CARD"
    * match out.value.responseCard.processInstanceId == "process.kafka.2"
    * match out.value.responseCard.process == "api_test"
    * match out.value.responseCard.state == "messageState"
    * match out.value.responseCard.externalRecipients[0] == "api_test_externalRecipient2"
    * match out.value.responseCard.titleTranslated == "Message"
    * match out.value.responseCard.summaryTranslated == "Message received"
    * match out.value.responseCard.data contains "test externalRecipients"

    #delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') { perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)' }
