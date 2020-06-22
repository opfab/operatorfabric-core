#/bin/sh

rm -rf target

echo "Zip all bundles"
cd thirds/resources
./packageBundles.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                      \
      thirds/deleteBundle.feature `#nice to be the very first one`\
      thirds/deleteBundleVersion.feature  \
      thirds/uploadBundle.feature         \
      thirds/getAThird.feature            \
      thirds/getCss.feature               \
      thirds/getDetailsThird.feature      \
      thirds/getI18n.feature              \
      thirds/getThirdActions.feature      \
      thirds/getThirds.feature            \
      thirds/getThirdTemplate.feature
