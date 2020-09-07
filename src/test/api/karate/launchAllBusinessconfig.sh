#/bin/sh

rm -rf target

echo "Zip all bundles"
cd businessconfig/resources
./packageBundles.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                      \
      businessconfig/deleteBundle.feature `#nice to be the very first one`\
      businessconfig/deleteBundleVersion.feature  \
      businessconfig/uploadBundle.feature         \
      businessconfig/getABusinessconfig.feature            \
      businessconfig/getCss.feature               \
      businessconfig/getDetailsBusinessconfig.feature      \
      businessconfig/getI18n.feature              \
      businessconfig/getBusinessconfigActions.feature      \
      businessconfig/getBusinessconfig.feature            \
      businessconfig/getBusinessconfigTemplate.feature
