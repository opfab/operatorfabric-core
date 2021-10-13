package org.opfab.cards.publication.kafka.integration;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.avro.*;
import org.opfab.cards.model.SeverityEnum;
import org.opfab.cards.publication.application.UnitTestApplication;
import org.opfab.cards.publication.configuration.kafka.ConsumerFactoryAutoConfiguration;
import org.opfab.cards.publication.configuration.kafka.KafkaListenerContainerFactoryConfiguration;
import org.opfab.cards.publication.configuration.kafka.ProducerFactoryAutoConfiguration;
import org.opfab.cards.publication.kafka.command.CreateCardCommandHandler;
import org.opfab.cards.publication.kafka.consumer.CardCommandConsumerListener;
import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.cards.publication.model.I18nPublicationData;
import org.opfab.cards.publication.model.TimeSpanPublicationData;
import org.opfab.cards.publication.repositories.ArchivedCardRepositoryForTest;
import org.opfab.cards.publication.repositories.CardRepositoryForTest;
import org.opfab.cards.publication.services.clients.impl.ExternalAppClientImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

@EmbeddedKafka(partitions = 1, bootstrapServersProperty="spring.kafka.bootstrap-servers")
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {UnitTestApplication.class})
@ContextConfiguration(classes = { CardCommandConsumerListener.class, ConsumerFactoryAutoConfiguration.class,
        KafkaListenerContainerFactoryConfiguration.class, ProducerFactoryAutoConfiguration.class, CreateCardCommandHandler.class})
@ActiveProfiles({"test", "kafka"})
@Profile("kafka")
@DirtiesContext
@TestInstance(TestInstance.Lifecycle.PER_CLASS)

public class SendKafkaCardShould {
    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Autowired
    private CardRepositoryForTest cardRepository;

    @Autowired
    private ArchivedCardRepositoryForTest archiveRepository;

    @Autowired
    private ExternalAppClientImpl appClient;

    @Autowired
    private KafkaTemplate<String, CardCommand> kafkaTemplate;

    @Value("${opfab.kafka.topics.card.topicname:opfab}")
    private String commandTopic;

    private static CountDownLatch latch ;
    private static boolean receiveCardCommandResultIsOK;
    private KafkaMessageListenerContainer<String, String> container;

    @AfterEach
    public void cleanAfter() {
        cardRepository.deleteAll();
        archiveRepository.deleteAll();
    }

    // Configure a dummy topic and listener so we know Kafka is ready when this method finishes
    @BeforeEach
    void setUp() {
        String TOPIC="DummyTopic";
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps("consumerGroup", "true", embeddedKafkaBroker));
        DefaultKafkaConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(configs, new StringDeserializer(), new StringDeserializer());
        ContainerProperties containerProperties = new ContainerProperties(TOPIC);
        container = new KafkaMessageListenerContainer<>(consumerFactory, containerProperties);
        BlockingQueue<ConsumerRecord<String, String>> records = new LinkedBlockingQueue<>();
        container.setupMessageListener((MessageListener<String, String>) records::add);
        container.start();
        ContainerTestUtils.waitForAssignment(container, embeddedKafkaBroker.getPartitionsPerTopic());
    }

    @AfterEach
    void tearDown() {
        container.stop();
    }

    @Test
    public void sendKafkaCardCommand() throws InterruptedException {
        String publisher = "myPublisher";
        String processVersion = "myVersion";
        long startDate = TimeUnit.MICROSECONDS.toMillis(Instant.now().getEpochSecond());
        SeverityType severityType = SeverityType.INFORMATION;
        String title = "MyTitle";
        String summary = "MySummary";
        String processInstanceId = UUID.randomUUID().toString();
        String taskId = "taskId";
        String state = "currentState";
        
        CardCommand cardCommand = CardCommand.newBuilder()
                .setCommand(CommandType.CREATE_CARD)
                .setCard(Card.newBuilder()
                        .setProcessInstanceId(processInstanceId)
                        .setProcess(taskId)
                        .setState(state)
                        .setPublisher(publisher)
                        .setProcessVersion(processVersion)
                        .setStartDate(startDate)
                        .setSeverity(severityType)
                        .setTitle(new I18n(title, null))
                        .setSummary(new I18n(summary, null))
                        .build())
                .build();

        kafkaTemplate.send(commandTopic,cardCommand);

        CardPublicationData card = cardRepository.findByProcessInstanceId(processInstanceId);
        for (int retries = 5; retries >0 && card == null; retries--){
            Thread.sleep(250);  // Give the database some time to persist the card
            card = cardRepository.findByProcessInstanceId(processInstanceId);
        }

        assertThat( card, is(notNullValue()));
    }

    @KafkaListener(topics = "${opfab.kafka.topics.response-card.topicname}")
    public void consumer(ConsumerRecord<String, CardCommand> consumerRecord) {
        CardCommand cardCommand = consumerRecord.value();
        Card card = cardCommand.getCard();

        receiveCardCommandResultIsOK = card.getPublisher().equals("PUBLISHER_1") &&
                cardCommand.getCommand() == CommandType.RESPONSE_CARD;
        latch.countDown();
    }

    @Test
    public void receiveCardCommand() throws InterruptedException {
       // Setup
        receiveCardCommandResultIsOK = false;
        latch = new CountDownLatch(1);

        // Send response card via Kafka
        CardPublicationData cardPublicationData = CardPublicationData.builder()
                .publisher("PUBLISHER_1").processVersion("O")
                .processInstanceId("PROCESS_1").severity(SeverityEnum.ALARM)
                .title(I18nPublicationData.builder().key("title").build())
                .summary(I18nPublicationData.builder().key("summary").build())
                .startDate(Instant.now())
                .timeSpan(TimeSpanPublicationData.builder()
                        .start(Instant.ofEpochMilli(123L)).build())
                .process("process1")
                .state("state1")
                .externalRecipient("camunda1")
                .build();

        appClient.sendCardToExternalApplication(cardPublicationData);

        assertThat (latch.await(5, TimeUnit.SECONDS), is (true));
        assertThat(receiveCardCommandResultIsOK, is(true));
    }
}
