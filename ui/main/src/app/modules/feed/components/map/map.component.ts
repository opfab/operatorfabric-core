/* Copyright (c) 2023, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Severity} from '@ofModel/light-card.model';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {takeUntil} from 'rxjs/operators';
import {ConfigService} from 'app/business/services/config.service';
import {MapService} from 'app/business/services/map.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {OpfabStore} from 'app/business/store/opfabStore';
import {OpfabMap} from 'app/modules/share/map/opfab-map';
import {NgFor} from '@angular/common';

@Component({
    selector: 'of-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    standalone: true,
    imports: [NgFor]
})
export class MapComponent extends OpfabMap implements OnInit, OnDestroy, AfterViewChecked {
    private filteredLightCardStore: FilteredLightCardsStore;
    private initialZoomToLocation: any;

    constructor(
        private translateService: TranslateService,
        private superChangeDetector: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute
    ) {
        super(translateService, superChangeDetector);
        this.targetElementId = 'ol-map';
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
            this.initialZoomToLocation = params.zoomToLocation;
        });
    }

    ngOnInit() {
        const maxZoom = ConfigService.getConfigValue('feed.geomap.maxZoom', 11);

        if (ConfigService.getConfigValue('feed.geomap.enableMap', false)) {
            const enableGraph = ConfigService.getConfigValue('feed.geomap.enableGraph', false);
            this.highlightPolygonStrokeWidth = ConfigService.getConfigValue(
                'feed.geomap.highlightPolygonStrokeWidth',
                2
            );
            this.drawMap(enableGraph);
            this.filteredLightCardStore
                .getFilteredAndSearchedLightCards()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((cards) => {
                    setTimeout(() => {
                        this.updateMap(cards, maxZoom, this.initialZoomToLocation);
                    }, 500);
                    if (enableGraph) {
                        setTimeout(() => this.updateGraph(cards), 500);
                    }
                });
            this.updateMapWhenGlobalStyleChange();
            MapService.highlightCardEvent.pipe(takeUntil(this.unsubscribe$)).subscribe(({lightCardId, highLight}) => {
                this.highlightFeature(lightCardId, highLight, this.highlightPolygonStrokeWidth);
            });
            MapService.zoomToLocationEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((lightCardId) => {
                this.zoomToLocation(lightCardId);
            });

            this.popupContent = ConfigService.getConfigValue('feed.geomap.popupContent', 'publishDateAndTitle');
        }
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
    }

    adaptTemplateSize() {
        const marginBottom = 30;
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

    private highlightFeature(lightCardId: string, highlight: boolean, highlightPolygonStrokeWidth: number) {
        const mapTemplate = document.getElementById('ol-map');
        if (mapTemplate && this.map && this.vectorLayer) {
            if (this.vectorLayer.getSource().getFeatures().length > 0) {
                const features = this.vectorLayer.getSource().getFeatures();
                features.forEach((feature) => {
                    if (feature.get('lightCard')?.id === lightCardId) {
                        feature.setStyle(function (feature) {
                            const severity: Severity = feature.get('lightCard').severity;
                            const geoType: string = feature.getGeometry().getType();
                            return MapComponent.getOpenLayersStyle(
                                geoType,
                                severity,
                                highlight,
                                highlightPolygonStrokeWidth
                            );
                        });
                    }
                });
            }
        }
    }

    private zoomToLocation(lightCardId: string) {
        const zoomLevelWhenZoomToLocation = ConfigService.getConfigValue('feed.geomap.zoomLevelWhenZoomToLocation', 14);
        if (this.vectorLayer && this.vectorLayer.getSource().getFeatures().length > 0) {
            const features = this.vectorLayer.getSource().getFeatures();
            features.forEach((feature) => {
                if (feature.get('lightCard')?.id === lightCardId) {
                    const ext = feature.getGeometry().getExtent();
                    this.map.getView().fit(ext, {
                        duration: 0,
                        maxZoom: zoomLevelWhenZoomToLocation,
                        padding: [20, 20, 20, 20],
                        callback: (_) => this.map.updateSize()
                    });
                }
            });
        }
    }

    showCard(lightCardId): void {
        this.router.navigate(['/feed', 'cards', lightCardId]);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isSmallscreen() {
        return window.innerWidth < 1000;
    }
}
