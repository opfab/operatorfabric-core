# Operator Fabric Core User Interface

This project was partially generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8. 

_note :_

>In the following document the variable declared as `OPERATOR_FABRIC_CORE_HOME` is the root folder of the `opertaor fabric core project`.
>
>The `CLI` acronym stand for `Command Line Interface`.
>
>The `SPA` acronym stand for `Single Page Application`.
>
>The `OS` acronym stand for `Operating System`.

## Run

### Linux

After launching docker containers, use the following command line `$OPERATOR_FABRIC_HOME/bin/run_all.sh start` to run the application. Once the whole application is ready, you have at least the following kind of message in your terminal :
```shell
##########################################################
Starting client-gateway-cloud-service, debug port: 5008
##########################################################
pid file: $OPERTAOR_FABRIC_HOME/services/infra/client-gateway/build/PIDFILE
Started with pid: 7479

##########################################################
Starting users-business-service, debug port: 5009
##########################################################
pid file: $OPERTAOR_FABRIC_HOME/services/core/users/build/PIDFILE
Started with pid: 7483

##########################################################
Starting time-business-service, debug port: 5010
##########################################################
pid file: $OPERTAOR_FABRIC_HOME/services/core/time/build/PIDFILE
Started with pid: 7488

##########################################################
Starting cards-consultation-business-service, debug port: 5011
##########################################################
pid file: $OPERTAOR_FABRIC_HOME/services/core/cards-consultation/build/PIDFILE
Started with pid: 7493

##########################################################
Starting cards-publication-business-service, debug port: 5012
##########################################################
pid file: $OPERTAOR_FABRIC_HOME/services/core/cards-publication/build/PIDFILE
```
Wait a few moments before trying to connect to the `SPA`, leaving time for the `client-gateway` to boot up completely. 

The `SPA`, on a local machine, is available at the following Url: `http://localhost:2002/home`.

To log in you need to use a valid user. Currently you need to use a connection pair define in `$OPERATOR_FABRIC_HOME/services/infra/auth/src/main/java/org/lfenergy/operatorfabric/auth/config/WebSecurityConfiguration.java`. It could be `admin` with `test`, for example.

To test the reception of cards, you could use the following script to create fake ones:
```shell
$OPERTAOR_FABRIC_HOME/services/core/cards-publication/src/main/bin/push_cards_loop.sh
```

Once, logged in, with that script running in background, you should be able to see some cards displayed in `http://localhost:2002/home/feed`.

### Windows

No script helpers provided for this OS. 

## Build

Run `ng build` to build the project. The build artifacts will be stored in :

```shell
$OPERATOR_FABRIC_CORE_HOME/services/infra/client-gateway/build/src/generated/resources/static/home`
``` 

## Test

### Standalone tests

Run in the `$OPERTAOR_FABRIC_HOME/ui/main` directory the command `ng test --watch=false` to execute the unit tests based on [Jasmine](https://jasmine.github.io) using [Karma](https://karma-runner.github.io) to drive the browser.

### Test during UI development

1. set your environment variables with `. $OPERTAOR_FABRIC_HOME/bin/load_environment_light.sh`;
2. run the microservices without launching the `client-gateway` using the following command: `$OPERTAOR_FABRIC_HOME/bin/run_all.sh -g false start`;
3. run aside the `client-gateway` by following those commands:
```shell
cd $OPERTAOR_FABRIC_HOME/services/infra/client-gateway
gradle bootrun
```
4. If needed, enable a card-operation test flow using the script `$OPERTAOR_FABRIC_HOME/service/core/cards-publication/src/main/bin/push_cards_loop.sh`;
5. once your code is ready to be tested in browser use the command: `ng build`;
6. open or reload the page in your browser using this url: `http://localhost:2002/home`.

## Known Bugs

### Login Page

* no error message displayed on wrong identication;

### Light Card flow

* not unsuscribe on logout;
