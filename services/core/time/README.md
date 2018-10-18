# Operator Fabric - Core - Time Management Service

This sub project manages Third Party Business Module registration

## 1. Set up and Build

see [Operator Fabric main page](../../README.md)

## 2. Features

This service allows to manage the reference time of Operator Fabird services along
with the speed of the time flow. This service don't allow translation of
Third party services provided data. The (not mandatory) time synchronization
is the sole responsibility of the third party services

## 3. Rest Endpoints and Data Model

See [swagger generated documentation](build/doc/api/index.html)

## 4. Disclaimer

The original functionalities of the deprecated gridos project included features
to make time "jump" at the closes previous or next card start time. For
now these features are not included in this service