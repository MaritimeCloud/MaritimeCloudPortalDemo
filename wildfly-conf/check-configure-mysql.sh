#!/bin/bash

# Set up the wildfly env 
DIR=`dirname $0`
source $DIR/wildfly-env.sh

MYSQL_DRIVER_VERSION=5.1.36
MYSQL_DRIVER=mysql-connector-java-$MYSQL_DRIVER_VERSION.jar
FILE=$WILDFLY_PATH/modules/com/mysql/main/$MYSQL_DRIVER

if [ -f $FILE ];
then
   echo "MySQL driver already installed."
else
   echo "Installing MySQL driver."
   pushd $DIR > /dev/null
   curl -o $MYSQL_DRIVER http://central.maven.org/maven2/mysql/mysql-connector-java/$MYSQL_DRIVER_VERSION/$MYSQL_DRIVER
   $WILDFLY_PATH/bin/jboss-cli.sh --file=check-configure-mysql.cli
   rm -f $MYSQL_DRIVER
   popd > /dev/null
fi


