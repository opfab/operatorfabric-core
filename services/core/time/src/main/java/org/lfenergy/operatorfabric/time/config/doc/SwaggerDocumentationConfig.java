package org.lfenergy.operatorfabric.time.config.doc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

/**
 * Swagger documentation configuration
 *
 * @author David Binder
 */
@Configuration
public class SwaggerDocumentationConfig {

  @Bean
  public Docket customImplementation() {
    return new Docket(DocumentationType.SWAGGER_2)
       .select()
       .apis(RequestHandlerSelectors.basePackage("org.lfenergy.operatorfabric.time.controllers"))
       .build()
       .directModelSubstitute(java.time.LocalDate.class, java.sql.Date.class)
       .directModelSubstitute(java.time.OffsetDateTime.class, java.util.Date.class)
       .apiInfo(apiInfo());
  }

  ApiInfo apiInfo() {
    return new ApiInfoBuilder()
       .title("Thirds Management")
       .description("Third Party Service a.k.a. Thirds management API for Operator Fabric")
       .license("Apache 2.0")
       .licenseUrl("http://www.apache.org/licenses/LICENSE-2.0.html")
       .termsOfServiceUrl("")
       .version("0.0.1")
       .contact(new Contact("", "", "benoit.jeanson@rte-france.com"))
       .build();
  }

}
