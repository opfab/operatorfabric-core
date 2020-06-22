package org.lfenergy.operatorfabric.externalApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@SpringBootApplication
public class ExternalAppApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(ExternalAppApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		log.info(" ******************************************************");
		log.info(" ***********  Welcom to External Application **********");
		log.info(" ******************************************************");
	}

}
