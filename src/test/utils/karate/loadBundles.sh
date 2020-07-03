#/bin/sh

echo "Zip all bundles"
cd businessconfig/resources
./packageBundles.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                           \
      businessconfig/postBundleTestAction.feature      \
      businessconfig/postBundleApiTest.feature         \

