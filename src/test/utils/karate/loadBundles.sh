#/bin/sh

echo "Zip all bundles"
cd thirds/resources
./packageBundles.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                           \
      thirds/postBundleTestAction.feature      \
      thirds/postBundleApiTest.feature         \

