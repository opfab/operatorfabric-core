/* Copyright (c) 2023, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';

import {LightCard} from '@ofModel/light-card.model';
import {ConfigService} from 'app/services/config/ConfigService';
import {TranslateService} from '@ngx-translate/core';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {OpfabMap} from 'app/components/share/map/opfab-map';
import {NgFor} from '@angular/common';
import {CardComponent} from '../../../card/card.component';

@Component({
    selector: 'of-monitoring-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: true,
    imports: [NgFor, CardComponent]
})
export class MonitoringMapComponent extends OpfabMap implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
    @Input() result: LightCard[];
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;

    modalRef: NgbModalRef;
    maxZoom: number = 11;
    enableGraph: boolean;

    constructor(
        private readonly translateService: TranslateService,
        private readonly modalService: NgbModal,
        private readonly superChangeDetector: ChangeDetectorRef
    ) {
        super(translateService, superChangeDetector);
        this.targetElementId = 'ol-monitoring-map';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.result) {
            setTimeout(() => this.updateMap(this.result, this.maxZoom), 500);
            if (this.enableGraph) {
                setTimeout(() => this.updateGraph(this.result), 500);
            }
        }
    }

    ngOnInit() {
        this.maxZoom = ConfigService.getConfigValue('feed.geomap.maxZoom', 11);
        this.enableGraph = ConfigService.getConfigValue('feed.geomap.enableGraph', false);

        if (ConfigService.getConfigValue('feed.geomap.enableMap', false)) {
            this.highlightPolygonStrokeWidth = ConfigService.getConfigValue(
                'feed.geomap.highlightPolygonStrokeWidth',
                2
            );
            this.drawMap(this.enableGraph);
            this.updateMap(this.result, this.maxZoom);
            this.updateMapWhenGlobalStyleChange();

            this.popupContent = ConfigService.getConfigValue('feed.geomap.popupContent', 'publishDateAndTitle');
        }
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
    }

    adaptTemplateSize() {
        const marginBottom = 5;
        const mapTemplate = document.getElementById(this.targetElementId);

        if (mapTemplate && this.map) {
            const diffWindow = mapTemplate.getBoundingClientRect();
            const mapTemplateHeight = window.innerHeight - (diffWindow.top + marginBottom);
            if (mapTemplate.style.height !== `${mapTemplateHeight}px`) {
                mapTemplate.style.height = `${mapTemplateHeight}px`;
                this.map.updateSize();
            }
        }
    }

    showCard(lightCardId) {
        SelectedCardService.setSelectedCardId(lightCardId);
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
