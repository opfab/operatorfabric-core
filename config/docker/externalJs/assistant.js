/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



// EXPERIMENTAL FEATURE 
// CAB PROJECT 

{
class OpfabAssistant extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <br/>
        Assistant
        <br/>
        <br/>
        <div class="opfab-textarea" style="position:relative;">
          <textarea id="comment" name="comment" rows="3"></textarea>
        </div>
        <br/>
        <div class="opfab-buttons" style="text-align: center;">
          <button id="opfab-monitoring-btn-search" class="opfab-btn">Envoyer</button>
        </div>
      `;
    }
  }
  
  customElements.define('opfab-assistant', OpfabAssistant);
}