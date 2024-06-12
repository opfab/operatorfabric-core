Feature: Kafka Producer and Consumer Demo

  Background:
    * def signIn = callonce read('../common/getToken.feature') { username: 'operator1_fr'}
    * def authToken = signIn.authToken
    * def signInAdmin = callonce read('../common/getToken.feature') { username: 'admin'}
    * def authTokenAdmin = signInAdmin.authToken
    * def KafkaProducer = Java.type('org.opfab.kafka.OpfabKafkaProducer')
    * def topic = 'opfab'
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


  Scenario: Write card to opfab topic and check card was published


  # Create new perimeter
  * callonce read('../common/createPerimeter.feature') { perimeter: '#(perimeter)', token: '#(authTokenAdmin)' }

  # Attach perimeter to group
  Given url opfabUrl + 'users/groups/ReadOnly/perimeters'
  And header Authorization = 'Bearer ' + authTokenAdmin
  And request perimeterArray
  When method patch
  Then status 200

  	* def card =
	"""
  {
    "publisher": "operator1_fr",
    "processInstanceId": "process.kafka.1",
    "process": "api_test",
    "processVersion": "1",
    "state": "messageState",
    "title": "message.title", 
    "summary": "message.summary",
    "groupRecipients": "Dispatcher,ReadOnly"
  }
  """
    

    * def kp = new KafkaProducer(kafkaServer)
    * kp.send(topic, card );

  	* def filter =
	"""
	{
	  "page" : 0,
	  "size" : 10,
	  "filters" : [
      {
        "columnName": "processInstanceId",
        "filter" : ["process.kafka.1"],
        "matchType": "EQUALS"
      }
    ],
	}
	"""
  
    * configure retry = { count: 5, interval: 1000 }
	  Given url opfabUrl + 'cards-consultation/cards'
	  And header Authorization = 'Bearer ' + authToken
	  And request filter
    And retry until responseStatus == 200  && response.numberOfElements == 1
	  Then method post
    And match response.content[0].processInstanceId == "process.kafka.1"
    And match response.content[0].process == "api_test"
    And match response.content[0].state == "messageState"

    #delete perimeter created previously
  * callonce read('../common/deletePerimeter.feature') { perimeterId: '#(perimeter.id)', token: '#(authTokenAdmin)' }
