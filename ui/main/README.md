# Operator Fabric Core User Interface

This project was partially generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8. 

These is a Work In Progress.

The authentication is done automatically and a dummy service for test is called to display `light cards`

## Build

Run `ng build` to build the project. The build artifacts will be stored in :

```shell
$OPERATOR_FABRIC_CORE_HOME/services/infra/client-gateway/build/src/generated/resources/static/home`

``` 

where `OPERATOR_FABRIC_CORE_HOME` is the root folder of the `opertaor fabric core project`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Current workflow

A `temporary automatic authentication action` is send by the `app component` in order to be connected to the `cards service`.

The `cards service` is requested for `card Operations`( using `SSE`) that respond by arrays of `Light Card` displayed by the `light card list component`.  