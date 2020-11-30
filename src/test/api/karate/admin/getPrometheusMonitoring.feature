Feature: get prometheus monitoring

  Scenario: get monitoring for users
    Given url opfabUserUrl + 'actuator/prometheus'
    When method get
    Then print response
    And status 200

  Scenario: get monitoring for businessConfig
    Given url opfabBusinessConfigUrl + 'actuator/prometheus'
    When method get
    Then print response
    And status 200

  Scenario: get monitoring for cards-publication
    Given url opfabCardsPublicationUrl + 'actuator/prometheus'
    When method get
    Then print response
    And status 200

  Scenario: get monitoring for cards-consultation
    Given url opfabCardsConsultationUrl + 'actuator/prometheus'
    When method get
    Then print response
    And status 200
