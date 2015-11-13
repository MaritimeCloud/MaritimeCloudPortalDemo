#!/bin/sh

# Set up the wildfly env 
DIR=`dirname $0`
source $DIR/wildfly-env.sh

echo "Please enter Wildfly admin user 'ci' password"
read PWD
$WILDFLY_PATH/bin/add-user.sh ci "$PWD" --silent

