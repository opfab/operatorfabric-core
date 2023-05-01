/* Copyright (c) 2023, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import {OSM, XYZ, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON.js';
import Overlay from 'ol/Overlay';
import {Style, Fill, Stroke, Circle} from 'ol/style';
import {Attribution, ZoomToExtent, Control, defaults as defaultControls} from 'ol/control';
import {ConfigService} from 'app/business/services/config.service';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {MapService} from 'app/business/services/map.service';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {TranslateService} from '@ngx-translate/core';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {Router} from '@angular/router';
import {DateTimeFormatterService} from '../../../../business/services/date-time-formatter.service';

let self;

@Component({
    selector: 'of-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewChecked {
    private unsubscribe$ = new Subject<void>();
    private map: OpenLayersMap;
    private vectorLayer: VectorLayer<VectorSource<any>>;
    private graphChart = null;
    public lightCardsToDisplay: LightCard[];

    constructor(
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private configService: ConfigService,
        private logger: OpfabLoggerService,
        private mapService: MapService,
        private translate: TranslateService,
        private globalStyleService: GlobalStyleService,
        private router: Router,
        private dateTimeFormatterService: DateTimeFormatterService
    ) {}

    ngOnInit() {
        self = this;

        if (this.configService.getConfigValue('feed.geomap.enableMap', false)) {
            const enableGraph = this.configService.getConfigValue('feed.geomap.enableGraph', false);
            this.drawMap(enableGraph);
            this.lightCardsFeedFilterService
                .getFilteredAndSearchedLightCards()
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((cards) => {
                    setTimeout(() => this.updateMap(cards), 500);
                    if (enableGraph) {
                        setTimeout(() => this.updateGraph(cards), 500);
                    }
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
        this.globalStyleService.getStyleChange().subscribe((style) => {
            this.updateMapColors(style);
            this.addGeoJSONLayer(style);
        });
    }

    private updateMapColors(style) {
        if (this.map) {
            let filter = '';
            if (style === GlobalStyleService.NIGHT) {
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
                features.forEach((feature) => {
                    if (feature.get('lightCard')?.id === lightCardId) {
                        feature.setStyle(function (feature) {
                            const severity: Severity = feature.get('lightCard').severity;
                            const geoType: string = feature.getGeometry().getType();
                            return MapComponent.getOpenLayersStyle(geoType, severity, highlight);
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
                        callback: (_) => this.map.updateSize()
                    });
                }
            });
        }
    }

    private drawMap(enableGraph: boolean) {
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
            target: 'ol-map',
            overlays: [overlay],
            controls: defaultControls({attribution: false}).extend([attribution])
        });

        const bgUrl = this.configService.getConfigValue('feed.geomap.bglayer.xyz.url', null);
        const bgTileSize = this.configService.getConfigValue('feed.geomap.bglayer.xyz.tileSize', null);
        if (bgUrl && bgTileSize) {
            const bgCrossOrigin = this.configService.getConfigValue('feed.geomap.bglayer.xyz.crossOrigin', null);
            this.map.addLayer(
                new TileLayer({
                    source: new XYZ({
                        url: bgUrl,
                        tileSize: bgTileSize,
                        crossOrigin: bgCrossOrigin
                    })
                })
            );
        } else {
            this.map.addLayer(
                new TileLayer({
                    source: new OSM()
                })
            );
        }

        if (enableGraph) {
            this.map.addControl(new GraphControl(null));
        }

        this.map.on('singleclick', function (evt) {
            displayLightCardIfNecessary(evt);
        });

        function displayLightCardIfNecessary(evt) {
            const featureArray = [];
            if (self.map.hasFeatureAtPixel(evt.pixel)) {
                self.map.getFeaturesAtPixel(evt.pixel).forEach((feature) => {
                    featureArray.push(feature.get('lightCard'));
                });
                overlay.setPosition(evt.coordinate);
                self.lightCardsToDisplay = featureArray;
            }
        }
    }

    private addGeoJSONLayer(style) {
        if (this.map) {
            const geojsonUrl = this.configService.getConfigValue('feed.geomap.layer.geojson.url', null);
            if (geojsonUrl) {
                let colorStroke = 'rgba(0, 0, 0, 0.6)';
                let colorFill = 'rgba(0, 0, 0, 0.05)';
                if (style === GlobalStyleService.NIGHT) {
                    colorStroke = 'rgba(255, 255, 255, 0.6)';
                    colorFill = 'rgba(255, 255, 255, 0.05)';
                }
                const vectorLayer = new VectorLayer({
                    source: new VectorSource({
                        format: new GeoJSON(),
                        url: geojsonUrl
                    }),
                    style: [
                        new Style({
                            stroke: new Stroke({
                                color: colorStroke,
                                width: 1.5
                            }),
                            fill: new Fill({
                                color: colorFill
                            })
                        })
                    ]
                });
                this.map.removeLayer(vectorLayer);
                this.map.addLayer(vectorLayer);
            }
        }
    }

    showCard(lightCardId): void {
        this.router.navigate(['/feed', 'cards', lightCardId]);
    }

    displayCardDetailsOnButton(lightCard: LightCard): string {
        const publishDate = this.dateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(lightCard.publishDate);
        return `${publishDate} : ${lightCard.titleTranslated}`;
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
                const geoType: string = feature.getGeometry().getType();
                return MapComponent.getOpenLayersStyle(geoType, severity);
            }
        });
        this.map.addLayer(this.vectorLayer);
        if (this.vectorLayer.getSource().getFeatures().length > 0) {
            this.map.getView().fit(this.vectorLayer.getSource().getExtent(), {
                duration: zoomDuration,
                maxZoom: maxZoom,
                padding: [20, 20, 20, 20],
                callback: (_) => this.map.updateSize()
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

    private static getOpenLayersStyle(type: string, severity: Severity, highlight = false): Style {
        switch (type) {
            case 'Point':
                return MapComponent.pointStyle(severity, highlight);
            case 'Polygon':
                return MapComponent.polygonStyle(severity, highlight);
            default:
                console.log('ERROR: Unsupported geo type: ' + type);
        }
    }

    private updateGraph(lightCards: LightCard[]) {
        let countAlarm = 0;
        let countAction = 0;
        let countCompliant = 0;
        let countInformational = 0;
        lightCards.forEach((lightCard) => {
            switch (lightCard.severity) {
                case Severity.ALARM:
                    countAlarm++;
                    break;
                case Severity.ACTION:
                    countAction++;
                    break;
                case Severity.COMPLIANT:
                    countCompliant++;
                    break;
                case Severity.INFORMATION:
                    countInformational++;
                    break;
            }
        });
        const data = [countAlarm, countAction, countCompliant, countInformational];
        this.updateGraphChart(self.graphChart, data);
    }

    private static severityToColorMap(opacity: number) {
        const severityColors: {[name: string]: string} = {
            [Severity.ALARM]: `rgba(167, 26, 26, ${opacity})`,
            [Severity.ACTION]: `rgba(253, 147, 18, ${opacity})`,
            [Severity.COMPLIANT]: `rgba(0, 187, 3, ${opacity})`,
            [Severity.INFORMATION]: `rgba(16, 116, 173, ${opacity})`
        };
        return severityColors;
    }

    private static pointStyle(severity: Severity, highlight: boolean) {
        const radiusMultiplier = highlight ? 2 : 1;
        return new Style({
            image: new Circle({
                radius: 7 * radiusMultiplier,
                fill: new Fill({
                    color: MapComponent.severityToColorMap(0.8)[severity]
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 2
                })
            })
        });
    }

    private static polygonStyle(severity: Severity, highlight: boolean) {
        const fillOpacity = highlight ? 0.6 : 0.1;
        return new Style({
            stroke: new Stroke({
                color: MapComponent.severityToColorMap(0.8)[severity],
                width: 2
            }),
            fill: new Fill({
                color: MapComponent.severityToColorMap(fillOpacity)[severity] // 'rgba(0, 0, 255, 0.1)'
            })
        });
    }

    private buildGraphChart(canvas) {
        if (self.graphChart) self.graphChart.destroy();
        const piechartDataObject = {
            labels: [
                this.translate.instant('shared.severity.alarm'),
                this.translate.instant('shared.severity.action'),
                this.translate.instant('shared.severity.compliant'),
                this.translate.instant('shared.severity.information')
            ],
            datasets: [
                {
                    label: 'Cards',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(167, 26, 26, 0.8)',
                        'rgba(253, 147, 18, 0.8)',
                        'rgba(0, 187, 3, 0.8)',
                        'rgba(16, 116, 173, 0.8)'
                    ]
                }
            ]
        };
        this.graphChart = new Chart(canvas, {
            type: 'doughnut',
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                borderColor: 'rgb(38, 47, 61, 0.8)',
                plugins: {
                    datalabels: {
                        display: function (context) {
                            return context.dataset.data[context.dataIndex] > 0;
                        },
                        color: 'rgb(38, 47, 61, 0.8)',
                        font: {
                            weight: 'bold',
                            size: 16
                        }
                    },
                    legend: {
                        display: false,
                        position: 'bottom'
                    },
                    title: {
                        display: false,
                        text: 'Cards'
                    }
                }
            },
            data: piechartDataObject
        });
    }

    private updateGraphChart(chart, data) {
        if (chart != null && chart.data != null) {
            chart.data.datasets.forEach((dataset) => {
                dataset.data = data;
            });
            chart.update();
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    isSmallscreen() {
        return window.innerWidth < 1000;
    }
}

class GraphControl extends Control {
    constructor(opt_options) {
        const options = opt_options || {};
        const element = document.createElement('div');
        element.className = 'ol-overlaycontainer-stopevent';
        element.style.top = '0.5em';
        element.style.right = '0.5em';
        element.style.height = '10vw';
        element.style.width = '10vw';
        element.style.position = 'absolute';
        const canvas = document.createElement('canvas');
        canvas.id = 'mapGraph';
        element.appendChild(canvas);
        super({
            element: element,
            target: options.target
        });
        self.buildGraphChart(canvas.getContext('2d'));
    }
}
