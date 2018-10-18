# RabbitMQ

## Docker container
In development mode, the simplest way to deploy a RabbitMQ server is to
create a RabbitMQ docker container. A docker compose file is provided
(src/main/docker/rabbitmq) to allow quick setup of a convenient RabbitMQ
 server.

## Server installation

This section is dedicated to in production deployment of RabbitMQ. It is
 not complete and needs to be taillored to any specific production
 environment.

### Download & Installation

Download and install RabbitMQ following the
[official procedure](https://www.rabbitmq.com/download.html) for the
target environment

### Used ports

If RabbitMQ may not bind to the following ports, it won't start :

* **4369**: epmd, a peer discovery service used by RabbitMQ nodes and
CLI tools
* **5672, 5671**: used by AMQP 0-9-1 and 1.0 clients without and with
TLS
* **25672**: used for inter-node and CLI tools communication
(Erlang distribution server port) and is allocated from a dynamic range
(limited to a single port by default, computed as AMQP port + 20000).
Unless external connections on these ports are really necessary
(e.g. the cluster uses federation or CLI tools are used on machines
outside the subnet), these ports should not be publicly exposed. See
networking guide for details.
* **35672-35682**: used by CLI tools (Erlang distribution client ports)
for communication with nodes and is allocated from a dynamic range
(computed as server distribution port + 10000 through server
distribution port + 10010). See networking guide for details.
* **15672**: HTTP API clients, management UI and rabbitmqadmin (*only if
the management plugin is enabled*)
* **61613, 61614**: STOMP clients without and with TLS
(*only if the STOMP plugin is enabled*)
* **1883, 8883**: (MQTT clients without and with TLS,
*if the MQTT plugin is enabled*)
* **15674**: STOMP-over-WebSockets clients
(*only if the Web STOMP plugin is enabled*)
* **15675**: MQTT-over-WebSockets clients
(*only if the Web MQTT plugin is enabled*)

### Production configuration

See the [guide](https://www.rabbitmq.com/production-checklist.html) for
production configuration guidelines

***TODO : summarize configuration for a default production environment***