package org.lfenergy.operatorfabric.thirds.config.doc;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Home redirection to swagger api documentation
 *
 * @author David Binder
 */
@Controller
public class HomeController {
  @RequestMapping(value = "/")
  public String index() {
    return "redirect:swagger-ui.html";
  }
}
