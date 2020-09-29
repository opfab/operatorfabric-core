#/bin/sh

echo "Zip bundle"
(
cd businessconfig/resources
./packageBundle.sh
)

echo "Launch Karate test"
java -jar karate.jar                           \
      businessconfig/postBundleDefaultProcess.feature         \
      businessconfig/postBundleUserCardExamples.feature       \



