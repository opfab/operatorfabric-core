[![MPL-2.0 License](https://img.shields.io/badge/license-MPL_2.0-blue.svg)](https://www.mozilla.org/en-US/MPL/2.0/)
[![Build Status](https://travis-ci.org/opfab/operatorfabric-core.svg?branch=master)](https://travis-ci.org/opfab/operatorfabric-core)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=org.lfenergy.operatorfabric%3Aoperatorfabric-core&metric=alert_status)](https://sonarcloud.io/dashboard?id=org.lfenergy.operatorfabric%3Aoperatorfabric-core)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=org.lfenergy.operatorfabric%3Aoperatorfabric-core&metric=coverage)](https://sonarcloud.io/component_measures?id=org.lfenergy.operatorfabric%3Aoperatorfabric-core&metric=Coverage)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=org.lfenergy.operatorfabric%3Aoperatorfabric-core&metric=code_smells)](https://sonarcloud.io/component_measures?id=org.lfenergy.operatorfabric%3Aoperatorfabric-core&metric=Maintainability)

# Operator Fabric (OpFab)

TODO What is OpFab

## 1. Licensing

This project and all its subproject is licensed under Mozilla Public License 2.0. See [LICENSE.txt](LICENSE.txt)

## 2. Requirements

### Tools and libraries

* Gradle 4.7 +
* Java 8.0.163-zulu +
* maven 3.5.3 +
* Docker
* Docker Compose with 2.1+ file format support

It is highly recommended to use sdkman ([sdkman.io](https://sdkman.io/)) and 
[nvm](https://github.com/creationix/nvm) to manage tools versions.
By **sourcing** bin/load_environment_light.sh which uses sdkman and nvm you can set
up a whole environment with gradle, java, maven and project variable set.

#### Software

* [RabbitMQ 3.7.6 +](RABBITMQ.md) : AMQP messaging layer allows inter service communication
* [MongoDB 4.0 +](MONGO.md) : Card persistent storage

RabbitMQ is required for :

* Time change push
* Card AMQP push
* Multiple service sync

MongoDB is required for :

* Current Card storage
* Archived Card storage
* User Storage

preconfigured mongo and rabbitmq are available in the form of docker-compose configuration file at
[src/main/docker](src/main/docker)

### Prerequisites

Before running containers with docker-compose, it is required to configure a docker network for them
```
docker network create opfabnet
```
You can also use the bin/setup_dockerized_environment which builds the services images ant sets up the opfabnet ntework

## 3. Project Structure

```
project
└──bin
└──client
│   └──cards (cards-client-data)
│   └──time (time-client-data)
│   └──users (users-client-data)
└──services
|   └──core
|   |   └──cards-consultation (cards-consultation-business-service)
|   |   └──cards-publication (cards-publication-business-service)
|   |   └──thirds (third-party-business-service)
|   |   └──time (time-business-service)
|   |   └──users (users-business-service)
|   └──infra
|   |   └──auth 
|   |   └──client-gateway (client-gateway-cloud-service)
|   |   └──config (configuration-cloud-service)
|   |   └──registry (registry-cloud-service)
└──tools
    └──spring-amqp-utilities
    └──spring-mongo-utilities
    └──spring-oauth2-utilities
    └──spring-utilities
    └──swagger-spring-generators
    └──test-utilities
    └──utilities
```

* bin : contains useful scripts
* client : contains REST APIs simple beans definition, may be used by external projects
* services: contains business microservices
    * [core](services/core/README.md) : contains core business micro services
        * [cards-consultation (cards-consultation-business-service)](services/core/cards-consultation/README.md) : Card consultation service. 
        * [cards-publication (cards-publication-business-service)](services/core/cards-publication/README.md) : Card publication service
        * [thirds (third-party-business-service)](services/core/thirds/README.md) : Thirdparty information service registry
        * [time (time-business-service)](services/core/time/README.md) : time management service
        * [users (users-business-service)](services/core/users/README.md) : users management service
    * [infra](services/infra/README.md): contains infrastructure microservices
        * [auth](services/infra/auth/README.md): Auth is a dummy development spring-oauth2 server used for testing and debugging other services.
        * [client-gateway (client-gateway-cloud-service)](services/infra/client-gateway/README.md): spring-gateway client side only gateway microservice, used to serve public apis and web ui. 
        * [config (configuration-cloud-service)](services/infra/config/README.md): spring-configuration centralized configuration microservice
        * [registry (registry-cloud-service)](services/registry/config/README.md): eureka microservice registry
* [tools](tools/README.md)
    * [spring-amqp-utilities](tools/spring-amqp-utilities/README.md) : Utility code with spring amqp specific dependencies, used to share common features across amqp dependent services
    * [spring-mongo-utilities](tools/spring-mongo-utilities/README.md) : Utility code  with spring specific dependencies, used to share common features across mongo dependent services
    * [spring-oauth2-utilities](tools/spring-oauth2-utilities/README.md) : Utility code  with spring specific dependencies, used to share common features across oauth2 dependent services
    * [spring-utilities](tools/spring-utilities/README.md) : Utility code  with spring specific dependencies
    * [swagger-spring-generators](tools/swagger-spring-generators/README.md) : Operator Fabric tailored spring boot generator for swagger
    * [test-utilities](tools/test-utilities/README.md) : Test specific utility code
    * [utilities](tools/utilities/README.md) : Utility code

### Projects structures and configurations
Projects must conforms to a few rules in order for the configured tasks to work

#### Java

* [subproject]/src/main/java : contains java source code
* [subproject]/src/test/java : contains java tests source code
* [subproject]/src/main/resources : contains resource files
* [subproject]/src/test/resources : contains test resource files

#### Modeling
Core services projects declaring REST APIS uses swagger for their definition must declare txo files :

* **[subproject]/src/main/modeling/swagger.yaml**: swagger api definition ;
* **[subproject]/src/main/modeling/config.json**: swagger generator configuration.

#### Docker

Services project all have docker image generated in their build cycle (See gradle tasks).

Per project configuration :

* docker file : **[subproject]/src/main/docker/Dockerfile**
* docker-compose file : **[subproject]/src/main/docker/docker-compose.yml**
* runtime data : **[subproject]/src/main/docker/volume** is copied to
**[subproject]/build/docker-volume/** by task **copyWorkingDir**. The latest
can then be mounted as volume in docker containers.

## 4. Docker demo
Demoable global docker compose files are available at :

* [root]/src/main/docker/demo : sets up all services, generate a dummy card every 5 seconds
* [root]/src/main/docker/deploy : sets up all services, ready for card reception

This demo setup exposes application at localhost:2002
Card publication is exposed at localhost:2102
For debugging purpose the following ports are also exposes :

Port  | Forwards to         |     |                                                  |
------|---------------------|-----|--------------------------------------------------|
2000  | config              |8080 |Configuration service http (REST)                 |
2001  | registry            |8080 |Registry service http (REST)                      |
2002  | gateway             |8080 |Gateway service http (REST+html)                  |
2100  | thirds              |8080 |Third party management service http (REST)        |
2101  | time                |8080 |Time management service http (REST)               |
2102  | cards-publication   |8080 |card publication service http (REST)              |
2103  | users               |8080 |Users management service http (REST)              |
2104  | cards-consultation  |8080 |card consultation service http (REST)             |
3000  | oauth               |8080 |Oauth development service http (REST)             |
4000  | config              |5005 |java debug port                                   |
4001  | registry            |5005 |java debug port                                   |
4002  | gateway             |5005 |java debug port                                   |
4100  | thirds              |5005 |java debug port                                   |
4101  | time                |5005 |java debug port                                   |
4102  | cards-publication   |5005 |java debug port                                   |
4103  | users               |5005 |java debug port                                   |
4103  | cards-consultation  |5005 |java debug port                                   |
5000  | oauth               |5005 |java debug port                                   |
27017 | mongo               |27017|mongo api  port                                   |
5672  | rabbitmq            |5672 |amqp api  port                                    |
15672 | rabbitmq            |15672|rabbitmq api  port                                |


## 6. Scripts (bin)

* bin/build_all.sh : builds all artifacts as gradle is not able to manage inter project dependencies
* bin/clean_all.sh : remove ide data (project configuration, build output idr) - idea, vsc ;
* bin/load_environment_light.sh : sets up environment when **sourced** (java version, gradle version, maven version, node version) ;
* bin/load_environment_ramdisk.sh  : sets up environment and links build subdirectories to a ramdisk when **sourced** at ~/tmp ;
* bin/run_all.sh : runs all all services (see bellow)
* bin/setup_dockerized_environment.sh : generate docker images for all services;

### load_environment_ramdisk.sh

There are prerequisites before sourcing load_environment_ramdisk.sh :

* logged user needs sudo rights for mount
* systems needs to have enough free ram
* never ever run a gradle clean to avoid those links being deleted

### run_all.sh

Please see ```run_all.sh -h``` usage before running.

Prerequisites

* mongo running on port 27017 with user "root" and password "password"
(See src/main/docker/mongodb/docker-compose.yml for a pre configured instance).
* rabbitmq running on port 5672 with user "guest" and password "guest"
(See src/main/docker/rabbitmq/docker-compose.yml for a pre configured instance).

Ports configuration

Port  |                     |                                                  |
------|---------------------|--------------------------------------------------|
2000  | config              |Configuration service http (REST)                 |
2001  | registry            |Registry service http (REST)                      |
2002  | gateway             |Gateway service http (REST+html)                  |
2100  | thirds              |Third party management service http (REST)        |
2101  | time                |Time management service http (REST)               |
2102  | cards-publication   |card publication service http (REST)              |
2103  | users               |Users management service http (REST)              |
2104  | cards-consultation  |card consultation service http (REST)             |
3000  | oauth               |Oauth development service http (REST)             |
4000  | config              |java debug port                                   |
4001  | registry            |java debug port                                   |
4002  | gateway             |java debug port                                   |
4100  | thirds              |java debug port                                   |
4101  | time                |java debug port                                   |
4102  | cards-publication   |java debug port                                   |
4103  | users               |java debug port                                   |
4103  | cards-consultation  |java debug port                                   |
5000  | oauth               |java debug port                                   |

### setup_dockerized_environment.sh

Please see ```setup_dockerized_environment.sh -h``` usage before running.

Builds all projects, generate docker images and volumes for docker-compose, also sets up docker network "opfabnet" if needed.

## 5. Environment variables

These variables are loaded by bin/load_environment_light.sh bin/load_environment_ramdisk.sh

* OF_HOME: Operator Fabric root dir
* OF_CORE: Operator Fabric business services subroot dir
* OF_INFRA: Operator Fabric infrastructure services subroot dir
* OF_CLIENT: Operator Fabric client data definition subroot dir
* OF_TOOLS: Operator Fabric tooling libraries subroot dir

Additionally, you may want to configure the following variables

* Docker build proxy configuration (used to configure alpine apk proxy settings)
    * APK_PROXY_URI
    * APK_PROXY_HTTPS_URI
    * APK_PROXY_USER
    * APK_PROXY_PASSWORD

## 7. Gradle Tasks

In this section only the most useful tasks are described for more
information on tasks, refer to "tasks" gradle task output and to gradle
and plugins official documentation

### Services

#### Common tasks for all subprojects

* Standard java gradle tasks
* SpringBoot tasks
    * bootJar : Generate project executable jar - assemble depends on this task;
    * bootRun : Runs the application;
* Palantir Docker tasks
    * docker - Builds Docker image.
    * dockerClean - Cleans Docker build directory.
    * dockerfileZip - Bundles the configured Dockerfile in a zip file
    * dockerPrepare - Prepares Docker build directory.
    * dockerPush - Pushes named Docker image to configured Docker Hub.
    * dockerPush[tag] - Pushes the Docker image with tag [tag] to configured Docker Hub
    * dockerTag - Applies all tags to the Docker image.
    * dockerTag[tag] - Tags Docker image with tag [tag]
* Docker Compose tasks:
    * composeUp: runs docker-compose up for docker file;
    * composeUp: runs docker-compose down for docker file;
    * composeStart: runs docker-compose start for docker file;
    * composeStop: runs docker-compose stop for docker file;
    * composeLogs: runs docker-compose logs -f for docker file;
* Other:
    * copyWorkingDir : copies [subproject]/src/main/docker/volume to [subproject]/build/
    * copyDependencies : copy dependencies to build/libs
    * generateTaskGraph : Generate png from displaying current life cycle tasks 

#### Core

* Swagger Generator tasks
    * generateSwaggerCode : generate swagger code for all configured swagger source
    * generateSwaggerCodeDoc : generate swagger static documentation as html. Outputs to build/doc/api.
    * generateSwaggerCodeEndpoints : ggenerate swagger code for subproject. Outputs to build/swagger.
    * debugSwaggerOperations : generate swager code from /src/main/modeling/config.json to build/swagger-analyse
    
##### Third Party Service

* Test tasks
    * prepareTestDataDir : prepare directory (build/test-data) for test data
    * compressBundle1Data, compressBundle2Data : generate tar.gz third party configuration data for tests in build/test-data
    * prepareDevDataDir : prepare directory (build/dev-data) for bootRun task
    * createDevData : prepare data in build/test-data for running bootRun task during developpement
    
#### infra

##### config

* Test tasks
    * createDevData : prepare data in build/test-data for running bootRun task during developpement

### Tools

#### Common tasks for all subprojects

* Standard java gradle tasks

#### swagger-spring-generators

Nope

## 8. Recipes

### Generating docker images

To Generate all docker images run ```bin/setup_dockerized_environment```,
it will generate all images and also generate an opfabnet docker network

NB: if you work behind a proxy you need to specify the following properties to
configure alpine apk package manager :

* apk.proxy.uri: proxy http uri ex: "http://somewhere:3128" (defaults to blank)
* apk.proxy.httpsuri: proxy http uri ex: "http://somewhere:3128" (defaults to apk.proxy.uri value)
* apk.proxy.user: proxy user
* apk.proxy.password: proxy __unescaped__ password

Alternatively, you may configure the following environment variables :

* APK_PROXY_URI
* APK_PROXY_HTTPS_URI
* APK_PROXY_USER
* APK_PROXY_PASSWORD

### Managing a service with docker-compose

Prerequisites : images must be registred

* To deploy a service run ```gradle :[subprojectPath]:composeUp```
example for the third-party-service service :
```
gradle :services:core:third-party-service:composeUp
```
* To tear down a service run ```gradle :[subprojectPath]:composeDown```
* To start an already containerized service run ```gradle :[subprojectPath]:composeStart```
* To stop an already containerized service run ```gradle :[subprojectPath]:composeStop```
* To follow logs of a running service run ```gradle :[subprojectPath]:composeLog```

### Running subproject from jar file

 * gradle :[subprojectPath]:bootJar
 * java -jar [subprojectPath]/build/libs/[subproject].jar

### Overriding properties when running from jar file

* java -jar [subprojectPath]/build/libs/[subproject].jar --spring.config.additional-location=file:[filepath]
NB : properties may be set using ".properties" file or ".yml" file. See [Spring Boot configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html) for more info.
* Generic property list extract :
    * server.port (defaults to 8080) : embedded server port
* :services:core:third-party-service properties list extract :
    * thirds.storage.path (defaults to "") : where to save/load Operator Fabric Third Party data

### Service port table

By default all service built artifacts are configured with server.port set to 8080

If you run the services using ```bootRun``` gradle task or the provided docker-compose files (see [prj]/src/main/docker) the ports used are

| Service             | bootRun port | docker-compose mapping | docker-compose debug mapping |
|---------------------|-------------:|-----------------------:|-----------------------------:|
| registry            |         2001 |                   2001 |                         2001 |
| gateway             |         2002 |                   2002 |                         2002 |
| thirds              |         2100 |                   2100 |                         2100 |
| time                |         2101 |                   2101 |                         2101 |
| cards-publication   |         2102 |                   2102 |                         2102 |
| users               |         2103 |                   2103 |                         2103 |
| cards-consultation  |         2104 |                   2104 |                         2104 |
| oauth               |         3000 |                   3000 |                         3000 |
| config              |         4000 |                   4000 |                         4000 |
| registry            |         4001 |                   4001 |                         4001 |
| gateway             |         4002 |                   4002 |                         4002 |
| thirds              |         4100 |                   4100 |                         4100 |
| time                |         4101 |                   4101 |                         4101 |
| cards-publication   |         4102 |                   4102 |                         4102 |
| users               |         4103 |                   4103 |                         4103 |
| cards-consultation  |         4103 |                   4103 |                         4103 |
| oauth               |         5000 |                   5000 |                         5000 |
| oauth               |         5000 |                   5000 |                         5000 |
