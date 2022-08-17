/* Copyright (c) 2022, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewChecked, Component, OnDestroy, OnInit} from '@angular/core';
import {Map as OpenLayersMap} from 'ol';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import WKT from 'ol/format/WKT';
import Overlay from 'ol/Overlay';
import {Style, Fill, Stroke, Circle} from 'ol/style';
import {Attribution, ZoomToExtent, defaults as defaultControls} from 'ol/control';
import {ConfigService} from '@ofServices/config.service';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {MapService} from '@ofServices/map.service';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

let self;

@Component({
    selector: 'of-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewChecked {
    private unsubscribe$ = new Subject<void>();
    private map: OpenLayersMap;
    private vectorLayer: VectorLayer;
    lightCardToDisplay: LightCard;

    constructor(
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private configService: ConfigService,
        private store: Store<AppState>,
        private logger: OpfabLoggerService,
        private mapService: MapService
    ) {}

    ngOnInit() {
        self = this;

        if (this.configService.getConfigValue('feed.geomap.enableMap', false)) {
            this.drawMap();
            this.lightCardsFeedFilterService
                .getFilteredAndSortedLightCards()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((cards) => {
                    setTimeout(() => this.updateMap(cards), 500);
                });
            this.updateMapWhenGlobalStyleChange();
            this.mapService.highlightCardEvent
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({lightCardId, highLight}) => {
                    this.highlightFeature(lightCardId, highLight);
                });
            this.mapService.zoomToLocationEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((lightCardId) => {
                this.zoomToLocation(lightCardId);
            });
        }
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
    }

    private updateMapWhenGlobalStyleChange() {
        this.store
            .select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((style) => this.updateMapColors(style));
    }

    private updateMapColors(style) {
        if (this.map) {
            let filter = '';
            if (style.style === 'NIGHT') {
                //change map color to Dark Mode
                filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
            }
            this.map.on('postcompose', () => {
                document.querySelector('canvas').style.filter = filter;
            });
            this.map.updateSize();
        }
    }

    private adaptTemplateSize() {
        const marginBottom = 30;
        const mapTemplate = document.getElementById('ol-map');

        if (!!mapTemplate && !!this.map) {
            const diffWindow = mapTemplate.getBoundingClientRect();
            const mapTemplateHeight = window.innerHeight - (diffWindow.top + marginBottom);
            if (mapTemplate.style.height !== `${mapTemplateHeight}px`) {
                mapTemplate.style.height = `${mapTemplateHeight}px`;
                this.map.updateSize();
            }
        }
    }

    private highlightFeature(lightCardId: string, highlight: boolean) {
        const mapTemplate = document.getElementById('ol-map');
        if (!!mapTemplate && !!this.map) {
            if (this.vectorLayer.getSource().getFeatures().length > 0) {
                const features = this.vectorLayer.getSource().getFeatures();
                const radius = highlight ? 2 : 1;
                features.forEach((feature) => {
                    if (feature.get('lightCard')?.id === lightCardId) {
                        feature.setStyle(function (feature) {
                            const severity: Severity = feature.get('lightCard').severity;
                            return MapComponent.getOpenLayersStyle(severity, radius);
                        });
                    }
                });
            }
        }
    }

    private zoomToLocation(lightCardId: string) {
        const zoomLevelWhenZoomToLocation = this.configService.getConfigValue(
            'feed.geomap.zoomLevelWhenZoomToLocation',
            14
        );
        if (this.vectorLayer.getSource().getFeatures().length > 0) {
            const features = this.vectorLayer.getSource().getFeatures();
            features.forEach((feature) => {
                if (feature.get('lightCard')?.id === lightCardId) {
                    const ext = feature.getGeometry().getExtent();
                    this.map.getView().fit(ext, {
                        duration: 0,
                        maxZoom: zoomLevelWhenZoomToLocation,
                        padding: [20, 20, 20, 20],
                        callback: this.map.updateSize()
                    });
                }
            });
        }
    }

    private drawMap() {
        const overlay = this.getClosePopupOverlay();
        const attribution = new Attribution({
            collapsible: true
        });

        const longitude = this.configService.getConfigValue('feed.geomap.initialLongitude', 0);
        const latitude = this.configService.getConfigValue('feed.geomap.initialLatitude', 0);
        const zoom = this.configService.getConfigValue('feed.geomap.initialZoom', 1);

        this.map = new OpenLayersMap({
            view: new View({
                center: fromLonLat([longitude, latitude]),
                zoom: zoom
            }),
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            target: 'ol-map',
            overlays: [overlay],
            controls: defaultControls({attribution: false}).extend([attribution])
        });

        this.map.on('singleclick', function (evt) {
            displayLightCardIfNecessary(evt);
        });

        function displayLightCardIfNecessary(evt) {
            self.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                overlay.setPosition(evt.coordinate);
                self.lightCardToDisplay = feature.get('lightCard');
            });
        }
    }

    private getExtentWithMargin() {
        const margin = 4000;
        const extent = this.vectorLayer.getSource().getExtent();
        extent[0] = extent[0] - margin;
        extent[1] = extent[1] - margin;
        extent[2] = extent[2] + margin;
        extent[3] = extent[3] + margin;
        return extent;
    }

    private updateMap(lightCards: LightCard[]) {
        const featureArray = [];
        this.map.removeLayer(this.vectorLayer);

        const maxZoom = this.configService.getConfigValue('feed.geomap.maxZoom', 11);
        const zoomDuration = this.configService.getConfigValue('feed.geomap.zoomDuration', 500);
        const defaultDataProjection = this.configService.getConfigValue(
            'feed.geomap.defaultDataProjection',
            'EPSG:4326'
        );

        lightCards
            .filter((lightCard) => lightCard.wktGeometry)
            .forEach((lightCard) => {
                try {
                    const format = new WKT();
                    const feature = format.readFeature(lightCard.wktGeometry, {
                        dataProjection: lightCard.wktProjection || defaultDataProjection,
                        featureProjection: 'EPSG:3857'
                    });
                    feature.set('lightCard', lightCard, true);
                    featureArray.push(feature);
                } catch (e) {
                    this.logger.error(
                        `Unable to parse wktGeometry: ${e} for cardId [${lightCard.id}] and process [${lightCard.process}]`
                    );
                }
            });
        this.vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: featureArray
            }),
            style: function (feature) {
                const severity: Severity = feature.get('lightCard').severity;
                return MapComponent.getOpenLayersStyle(severity);
            }
        });
        this.map.addLayer(this.vectorLayer);
        if (this.vectorLayer.getSource().getFeatures().length > 0) {
            this.map.getView().fit(this.vectorLayer.getSource().getExtent(), {
                duration: zoomDuration,
                maxZoom: maxZoom,
                padding: [20, 20, 20, 20],
                callback: this.map.updateSize()
            });

            this.map.getControls().push(
                new ZoomToExtent({
                    extent: this.getExtentWithMargin(),
                    label: 'R',
                    tipLabel: 'Reset to default view'
                })
            );
        }
    }

    private getClosePopupOverlay(): Overlay {
        const container = document.getElementById('popup');
        const closer = document.getElementById('popup-closer');
        /**
         * Create an overlay to anchor the popup to the map.
         */
        const overlay = new Overlay({
            element: container,
            autoPan: {
                animation: {
                    duration: 250
                }
            }
        });

        /**
         * Add a click handler to hide the popup.
         * @return {boolean} Don't follow the href.
         */
        closer.onclick = function () {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        return overlay;
    }

    private static getOpenLayersStyle(severity: Severity, radiusMultiplier = 1): Style {
        return MapComponent.openLayersForPointStyles(radiusMultiplier)[severity];
    }

    private static openLayersForPointStyles(radiusMultiplier = 1) {
        const alarmStyle = new Style({
            image: new Circle({
                radius: 7 * radiusMultiplier,
                fill: new Fill({
                    color: 'rgba(167, 26, 26, 0.8)'
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 2
                })
            })
        });
        const actionStyle = new Style({
            image: new Circle({
                radius: 7 * radiusMultiplier,
                fill: new Fill({
                    color: 'rgba(253, 147, 18, 0.8)'
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 2
                })
            })
        });
        const compliantStyle = new Style({
            image: new Circle({
                radius: 7 * radiusMultiplier,
                fill: new Fill({
                    color: 'rgba(0, 187, 3, 0.8)'
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 2
                })
            })
        });
        const informationStyle = new Style({
            image: new Circle({
                radius: 7 * radiusMultiplier,
                fill: new Fill({
                    color: 'rgba(16, 116, 173, 0.8)'
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 1
                })
            })
        });

        const geoStyles: {[name: string]: Style} = {
            [Severity.ALARM]: alarmStyle,
            [Severity.ACTION]: actionStyle,
            [Severity.COMPLIANT]: compliantStyle,
            [Severity.INFORMATION]: informationStyle
        };
        return geoStyles;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isSmallscreen() {
        return window.innerWidth < 1000;
    }
}
