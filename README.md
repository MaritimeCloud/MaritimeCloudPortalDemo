# BalticWebServiceReg
Mock-up BalticWeb Service Registry. 

The Service Registry project is a web application that can be used for configuring Maritime Cloud services.
It integrates with the BalticWebIdReg and use the LDAP and Keycloak servers as its Identity Registry.
Indeed, current implementation will store services in LDAP as well.

Sub-projects:

* bw-servicereg-core: Defines the main REST API
* bw-servicereg-ldap: An LDAP implementation of the underlying services. Will store services in LDAP.
* bw-servicereg-model: The model classes returned by the REST API.
* bw-servicereg-testdata: Imports a lot of test services into the system.
* bw-servicereg-web: The actual Service Registry web application.

## Prerequisites

* Java 8
* Maven 3
* BalticWebIdReg (LDAP + Keycloak must be running)

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

In the pom.xml, update the dependencies to change the system:

* Remove the dependency on the bw-servicereg-testdata project, if you do now want test data in the system.
* If you implement, say, a DB backend, substitute the bw-servicereg-ldap dependency with your new implementation.

There are different levels of roles in the system: Site roles (user, admin), organization roles (user, admin, invited, applicant) and service roles (user, admin).
In order to register or modify a service, you need to be site admin or organization admin for the organization that the service is registered under. 
Initially, there is only one site admin (username "ged" and password "ged"). You can use this to log in and manage services or organization roles for all other users.

