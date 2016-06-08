# NOTE: Mock-up project of the Maritime Cloud Portal

This project has been developed as a pure Mock-up project for showing the functionallity of the Maritime Cloud Identity Registry https://github.com/MaritimeCloud/IdentityRegistry
The project started as another Portal and has shamelessly been altered without proper cleanup of legacy code. The reason for this was to speed up the development for showing t a functioning Portal at a Conference. Further development will be done in a new and fresh project.

A running version can be found at https://portal.maritimecloud.net

## Prerequisites

* Java 8
* Maven 3
* MySQL

## Install and configure Wildfly

    ./wildfly-conf/install-wildfly.sh

### Local Deployment (Development)

Start Wildfly using the command:

    ./wildfly-9.0.1.Final/bin/standalone.sh

Build and deploy the Service Registry web application using:

    mvn clean install
    cd bw-servicereg-web
    mvn wildfly:deploy

Or use your favourite Development IDE.

## Notes

There are currently very limited error handling. If the Portal for some reason doesn't react, do a log out.