
package org.lfenergy.operatorfabric.webui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class WebUiApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebUiApplication.class, args);
	}

}

