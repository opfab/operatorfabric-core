#/bin/sh

echo "Zip bundle"
cd businessconfig/resources
./packageBundle.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                           \
      businessconfig/postBundleDefaultProcess.feature         \

