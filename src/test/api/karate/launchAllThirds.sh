#/bin/sh

rm -rf target

java -jar karate.jar                    \
      thirds/uploadBundle.feature       \
      thirds/getAThird.feature          \
      thirds/getCss.feature             \
      thirds/getDetailsThird.feature    \
      thirds/getI18n.feature            \
      thirds/getThirdActions.feature    \
      thirds/getThirds.feature          \
      thirds/getThirdTemplate.feature

