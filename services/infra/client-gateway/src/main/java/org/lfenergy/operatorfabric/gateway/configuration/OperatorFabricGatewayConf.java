package org.lfenergy.operatorfabric.gateway.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties("operatorfabric.gateway")
@Data
public class OperatorFabricGatewayConf {
    private List<String> configs;
}
