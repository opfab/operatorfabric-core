function() {   
  /* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */ 

    var  opfab_server = "http://localhost"
    var opfab_port = "2002"
    var config = { // base config JSON
     
      opfabUrl: opfab_server + ":" + opfab_port + "/",
      opfabPublishCardUrl: opfab_server +":2102/",
      opfabUserUrl: opfab_server +":2103/",
      opfabBusinessConfigUrl: opfab_server +":2100/",
      opfabCardsConsultationUrl: opfab_server +":2104/",
      opfabCardsPublicationUrl: opfab_server +":2102/"
    };

    karate.logger.debug('url opfab :' + config.opfabUrl );
    // don't waste time waiting for a connection or if servers don't respond within 5 seconds
    karate.configure('connectTimeout', 5000);
    karate.configure('readTimeout', 5000);
    return config;
  }
