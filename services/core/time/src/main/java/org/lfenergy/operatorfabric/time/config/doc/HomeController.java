package org.lfenergy.operatorfabric.time.config.doc;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Home redirection to swagger api documentation
 */
@Controller
public class HomeController {
  @RequestMapping(value = "/")
  public String index() {
    return "redirect:swagger-ui.html";
  }
}
