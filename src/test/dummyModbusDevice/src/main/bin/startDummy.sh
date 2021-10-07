
applicationOptions="--spring.profiles.active=dev --spring.config.location=classpath:/application.yml,file:${OF_HOME}/config/dev/ --spring.config.name=common,dummy-modbus-device"
projectBuildPath="src/test/dummyModbusDevice/build"
version=$OF_VERSION

cd $OF_HOME

mkdir -p $projectBuildPath/logs

java -Xss512k -XX:MaxRAM=512m \
      -jar $projectBuildPath/libs/dummyModbusDevice-$version.jar \
      $applicationOptions 2>&1 > $projectBuildPath/logs/$(date \+"%y-%m-%d").log &

echo $! > $projectBuildPath/PIDFILE

echo "Started with pid: $!"