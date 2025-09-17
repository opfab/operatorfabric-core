/* Copyright (c) 2023, Alliander (http://www.alliander.com)
/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
/* Copyright (c) 2025, RTE International (https://www.rte-international.com/)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Map as OpenLayersMap} from 'ol';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer} from 'ol/layer';
import {OSM, XYZ, Vector as VectorSource, ImageArcGISRest} from 'ol/source';
import {fromLonLat, get as getProjection, transform} from 'ol/proj';
import {Card} from 'app/model/Card';
import {Severity} from 'app/model/Severity';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';
import WKT from 'ol/format/WKT';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import GeoJSON from 'ol/format/GeoJSON.js';
import Overlay from 'ol/Overlay';
import {Style, Fill, Stroke, Circle} from 'ol/style';
import {Attribution, ZoomToExtent, Control, defaults as defaultControls} from 'ol/control';
import {ConfigService} from 'app/services/config/ConfigService';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {TranslateService} from '@ngx-translate/core';
import {GlobalStyleService} from '@ofServices/style/global-style.service';
import {ChangeDetectorRef} from '@angular/core';
import {DateTimeFormatterService} from '../../../services/dateTimeFormatter/DateTimeFormatterService';

let self;

// Lambert 93 extent for France including Corsica
const LAMBERT93_EXTENT = [47680, 6037008, 1302430, 7230727];

// Night mode CSS filter for map tiles
const NIGHT_MODE_FILTER = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';

export abstract class OpfabMap {
    unsubscribe$ = new Subject<void>();
    map: OpenLayersMap;
    vectorLayer: VectorLayer<VectorSource<any>>;
    graphChart = null;
    public lightCardsToDisplay: Card[] = [];
    popupContent: string;
    targetElementId: string;

    highlightPolygonStrokeWidth: number = 2;
    private postRenderHandler?: (e: any) => void;
    private geoJsonLayers: VectorLayer<VectorSource<any>>[] = [];

    constructor(
        private readonly translate: TranslateService,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        self = this;
    }

    updateMapWhenGlobalStyleChange() {
        GlobalStyleService.getStyleChange()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((style) => {
                this.updateMapColors(style);
                this.addGeoJSONLayer(style);
                this.map.render();
            });
    }

    private setupProjections() {
        // Define Lambert 93 (EPSG:2154)
        proj4.defs(
            'EPSG:2154',
            '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
        );

        // Save in OpenLayers
        register(proj4);

        // Define the extent of France in Lambert 93 (including Corsica)
        const lambert93Projection = getProjection('EPSG:2154');
        if (lambert93Projection) {
            lambert93Projection.setExtent(LAMBERT93_EXTENT);
        }
    }

    private getProjectionConfig() {
        const supportedProjections = {
            'EPSG:3857': {
                name: 'Web Mercator',
                extent: [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]
            },
            'EPSG:2154': {
                name: 'Lambert 93',
                extent: LAMBERT93_EXTENT
            }
        };

        // Get default data projection once
        const defaultDataProjection = ConfigService.getConfigValue('feed.geomap.defaultDataProjection', 'EPSG:4326');

        // 1. New optional parameter (priority)
        const mapProjection = ConfigService.getConfigValue('feed.geomap.mapProjection', null);
        if (mapProjection) {
            const config = supportedProjections[mapProjection];
            if (!config) {
                logger.warn(`Unsupported projection: ${mapProjection}, using EPSG:3857 as default`);
                return {
                    mapProjection: 'EPSG:3857',
                    dataProjection: defaultDataProjection,
                    config: supportedProjections['EPSG:3857']
                };
            }
            return {
                mapProjection,
                dataProjection: defaultDataProjection,
                config
            };
        }

        // 2. Backward compatibility fallback
        return {
            mapProjection: 'EPSG:3857',
            dataProjection: defaultDataProjection,
            config: supportedProjections['EPSG:3857']
        };
    }

    private transformInitialCoordinates(
        longitude: number,
        latitude: number,
        targetProjection: string
    ): [number, number] {
        // Check if coordinates are already in Lambert 93 (EPSG:2154) for France
        if (targetProjection === 'EPSG:2154') {
            // Check if coordinates are within Lambert 93 extent (including Corsica)
            const [minX, minY, maxX, maxY] = LAMBERT93_EXTENT;
            if (longitude >= minX && longitude <= maxX && latitude >= minY && latitude <= maxY) {
                // Coordinates are already in Lambert 93, no transformation needed
                return [longitude, latitude] as [number, number];
            }
        }

        // Auto-detect EPSG:3857 inputs (meters) vs WGS84 degrees
        if (targetProjection === 'EPSG:3857') {
            // If values are outside plausible lon/lat ranges, assume already in 3857
            if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
                return [longitude, latitude] as [number, number];
            }
            return fromLonLat([longitude, latitude]) as [number, number];
        }

        // Otherwise, assume WGS84 and transform to target
        const sourceProjection = 'EPSG:4326';
        return transform([longitude, latitude], sourceProjection, targetProjection) as [number, number];
    }

    private shouldApplyDarkMode(style): boolean {
        const colorMode = ConfigService.getConfigValue('feed.geomap.colorMode', 'uiTheme');

        if (colorMode === 'dark') {
            return true;
        } else if (colorMode === 'light') {
            return false;
        } else if (colorMode === 'uiTheme') {
            // Follow the global UI theme
            return style === GlobalStyleService.NIGHT;
        } else {
            // Default behavior: follow UI theme
            return style === GlobalStyleService.NIGHT;
        }
    }

    private getConfiguredLayers(): any[] {
        return ConfigService.getConfigValue('feed.geomap.layers', []);
    }

    private updateMapColors(style) {
        if (this.map) {
            let filter = '';

            if (this.shouldApplyDarkMode(style)) {
                filter = NIGHT_MODE_FILTER;
            }

            const viewport = this.map.getViewport?.();
            const applyFilter = () => {
                if (viewport) {
                    viewport.querySelectorAll('canvas').forEach((c: HTMLCanvasElement) => (c.style.filter = filter));
                }
            };
            // Remove previous handler if any, then add a single listener
            if (this.postRenderHandler) {
                this.map.un('postrender', this.postRenderHandler as any);
            }
            this.postRenderHandler = applyFilter;
            this.map.on('postrender', this.postRenderHandler as any);
            // Apply immediately for current frame
            applyFilter();
            this.map.updateSize();
        }
    }

    drawMap(enableGraph: boolean) {
        // Configure all available projections
        this.setupProjections();

        // Determine projection configuration to use
        const projectionConfig = this.getProjectionConfig();

        const overlay = this.getClosePopupOverlay();
        const attribution = new Attribution({
            collapsible: true
        });

        // Get coordinates from config
        const longitude = ConfigService.getConfigValue('feed.geomap.initialLongitude', 0);
        const latitude = ConfigService.getConfigValue('feed.geomap.initialLatitude', 0);
        const zoom = ConfigService.getConfigValue('feed.geomap.initialZoom', 1);
        this.highlightPolygonStrokeWidth = ConfigService.getConfigValue('feed.geomap.highlightPolygonStrokeWidth', 2);

        // Transform coordinates to target projection
        const transformedCenter = this.transformInitialCoordinates(longitude, latitude, projectionConfig.mapProjection);

        // Create map with configured projection
        this.map = new OpenLayersMap({
            view: new View({
                projection: projectionConfig.mapProjection,
                center: transformedCenter,
                zoom: zoom,
                extent: projectionConfig.config.extent
            }),
            target: this.targetElementId,
            overlays: [overlay],
            controls: defaultControls({attribution: false}).extend([attribution])
        });

        this.addLayers();
        this.addGeoJSONLayer(GlobalStyleService.getStyle());
        if (enableGraph) {
            this.map.addControl(new GraphControl(null));
        }

        // Apply initial day/night mode
        this.updateMapColors(GlobalStyleService.getStyle());

        this.map.on('singleclick', function (evt) {
            displayLightCardIfNecessary(evt);
        });
        function displayLightCardIfNecessary(evt) {
            const featureArray = [];
            if (self.map.hasFeatureAtPixel(evt.pixel)) {
                self.map.getFeaturesAtPixel(evt.pixel).forEach((feature) => {
                    if (feature.get('lightCard')) featureArray.push(feature.get('lightCard'));
                });
                if (featureArray.length > 0) {
                    overlay.setPosition(evt.coordinate);
                    self.lightCardsToDisplay = featureArray;
                    self.changeDetector.markForCheck();
                }
            }
        }
    }

    private validateLayerConfiguration(layer: any): boolean {
        if (!layer.type) {
            logger.error(`Invalid XYZ layer configuration: missing url`);
            return false;
        }

        switch (layer.type) {
            case 'wmts':
                if (!layer.capabilitiesUrl || !layer.layer || !layer.matrixSet) {
                    logger.error(
                        `Invalid WMTS layer configuration: missing required properties (capabilitiesUrl, layer, matrixSet). details=${JSON.stringify(layer)}`
                    );
                    return false;
                }
                break;
            case 'xyz':
                if (!layer.url) {
                    logger.error(`Invalid XYZ layer configuration: missing url`);
                    return false;
                }
                break;
            case 'esri':
            case 'arcgis':
                if (!layer.url) {
                    logger.error(`Invalid ArcGIS layer configuration: missing url`);
                    return false;
                }
                break;
            case 'geojson':
                if (!layer.url) {
                    logger.error(`Invalid GeoJSON layer configuration: missing url`);
                    return false;
                }
                break;
            case 'osm':
                // OSM layers don't require additional parameters
                break;
            default:
                logger.warn(`Unknown layer type: ${layer.type}`);
                return false;
        }

        return true;
    }

    addLayers() {
        const layers = this.getConfiguredLayers();
        if (layers && layers.length > 0) {
            layers.forEach((layer) => {
                // Validate layer configuration before processing
                if (!this.validateLayerConfiguration(layer)) {
                    return;
                }

                switch (layer.type) {
                    case 'wmts':
                        this.addWMTSLayer(layer.capabilitiesUrl, layer.layer, layer.matrixSet, layer);
                        break;
                    case 'xyz':
                        this.map.addLayer(
                            new TileLayer({
                                source: new XYZ({
                                    url: layer.url,
                                    tileSize: layer.tileSize,
                                    crossOrigin: 'anonymous'
                                }),
                                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                                zIndex: layer.zIndex !== undefined ? layer.zIndex : 0
                            })
                        );
                        break;
                    case 'osm':
                        this.map.addLayer(
                            new TileLayer({
                                source: new OSM({crossOrigin: 'anonymous'}),
                                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                                zIndex: layer.zIndex !== undefined ? layer.zIndex : 0
                            })
                        );
                        break;
                    case 'esri':
                    case 'arcgis':
                        // ArcGIS layer support
                        this.addArcGISLayer(layer);
                        break;
                    case 'geojson':
                        // GeoJSON layers are processed in batch for better performance
                        break;
                    default:
                        logger.warn(`Unknown layer type: ${layer.type}`);
                        break;
                }
            });
        }
    }

    async addWMTSLayer(capabilitiesUrl: string, layer: string, matrixSet: string, layerConfig?: any) {
        const parser = new WMTSCapabilities();
        try {
            const response = await fetch(capabilitiesUrl);

            if (!response.ok) {
                logger.error(`Failed to fetch WMTS capabilities: ${response.status} ${response.statusText}`);
                return;
            }

            const text = await response.text();
            const result = parser.read(text);

            // Validate that the layer exists in capabilitiesUrl
            if (!result.Contents?.Layer?.find((l) => l.Identifier === layer)) {
                logger.error(`Layer '${layer}' not found in WMTS capabilities ${capabilitiesUrl}`);
                return;
            }
            const options = optionsFromCapabilities(result, {
                layer: layer,
                matrixSet: matrixSet
            });
            // Ensure CORS works consistently
            (options as any).crossOrigin = 'anonymous';

            // Use opacity and zIndex from configuration
            const opacity = layerConfig?.opacity !== undefined ? layerConfig.opacity : 1;
            const zIndex = layerConfig?.zIndex !== undefined ? layerConfig.zIndex : 0;

            // Create WMTS layer
            const wmtsLayer = new TileLayer({
                opacity,
                source: new WMTS(options),
                zIndex
            });

            // For Lambert 93, set extent constraint to avoid 404 errors on tiles outside valid area
            const projectionConfig = this.getProjectionConfig();
            if (projectionConfig.mapProjection === 'EPSG:2154') {
                const constrainExtent = ConfigService.getConfigValue('feed.geomap.constrainLambert93Extent', true);
                if (constrainExtent) {
                    wmtsLayer.setExtent(projectionConfig.config.extent);
                }
            }

            this.map.addLayer(wmtsLayer);
        } catch (error) {
            logger.error(`Failed to add WMTS layer '${layer}': ${String(error)}`);
        }
    }

    updateMap(cards: Card[], maxZoom: number, initialZoomToLocation?: string) {
        if (this.map) {
            const projectionConfig = this.getProjectionConfig();

            const featureArray = [];
            if (this.vectorLayer) {
                this.map.removeLayer(this.vectorLayer);
            }

            const zoomDuration = ConfigService.getConfigValue('feed.geomap.zoomDuration', 500);
            const zoomLevelWhenZoomToLocation = ConfigService.getConfigValue(
                'feed.geomap.zoomLevelWhenZoomToLocation',
                14
            );

            cards
                .filter((lightCard) => lightCard.wktGeometry)
                .forEach((lightCard) => {
                    try {
                        const format = new WKT();
                        const feature = format.readFeature(lightCard.wktGeometry, {
                            dataProjection: lightCard.wktProjection || projectionConfig.dataProjection,
                            featureProjection: projectionConfig.mapProjection
                        });
                        feature.set('lightCard', lightCard, true);
                        featureArray.push(feature);
                    } catch (e) {
                        logger.error(
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
                    return OpfabMap.getOpenLayersStyle(geoType, severity, false, self.highlightPolygonStrokeWidth);
                },
                zIndex: 2000 // Keep geometries on top of all layers
            });

            this.map.addLayer(this.vectorLayer);

            if (this.vectorLayer.getSource().getFeatures().length > 0) {
                if (initialZoomToLocation) {
                    this.vectorLayer
                        .getSource()
                        .getFeatures()
                        .forEach((feature) => {
                            if (feature.get('lightCard')?.id === initialZoomToLocation) {
                                const ext = feature.getGeometry().getExtent();
                                this.map.getView().fit(ext, {
                                    duration: 0,
                                    maxZoom: zoomLevelWhenZoomToLocation,
                                    padding: [20, 20, 20, 20],
                                    callback: (_) => this.map.updateSize()
                                });
                            }
                        });
                } else
                    this.map.getView().fit(this.vectorLayer.getSource().getExtent(), {
                        duration: zoomDuration,
                        maxZoom: maxZoom,
                        padding: [20, 20, 20, 20],
                        callback: (_) => this.updateMapSize()
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
    }

    updateMapSize() {
        this.map.updateSize();
        this.changeDetector.markForCheck();
    }

    addGeoJSONLayer(style: string) {
        if (this.map) {
            let colorStroke = 'rgba(0, 0, 0, 0.6)';
            let colorFill = 'rgba(0, 0, 0, 0.05)';

            if (this.shouldApplyDarkMode(style)) {
                // Apply night mode colors
                colorStroke = 'rgba(255, 255, 255, 0.6)';
                colorFill = 'rgba(255, 255, 255, 0.05)';
            }
            const defaultStyle = new Style({
                stroke: new Stroke({
                    color: colorStroke,
                    width: 1.5
                }),
                fill: new Fill({
                    color: colorFill
                })
            });

            const geojsonLayers = this.getConfiguredLayers().filter((layer) => layer.type === 'geojson');

            // Remove previously added GeoJSON layers
            this.geoJsonLayers.forEach((l) => this.map.removeLayer(l));
            this.geoJsonLayers = [];

            geojsonLayers.forEach((geojson) => {
                // Validate GeoJSON layer configuration
                if (!this.validateLayerConfiguration(geojson)) {
                    return;
                }

                const layerSource = new VectorSource({
                    format: new GeoJSON(),
                    url: geojson.url
                });

                const vectorLayer = new VectorLayer({
                    source: layerSource,
                    style: geojson.style ? this.convertFlatStyleToOpenLayersStyle(geojson.style) : defaultStyle,
                    opacity: geojson.opacity !== undefined ? geojson.opacity : 1,
                    zIndex: geojson.zIndex !== undefined ? geojson.zIndex : 0
                });

                this.map.addLayer(vectorLayer);
                this.geoJsonLayers.push(vectorLayer);
            });
        }
    }

    abstract showCard(lightCardId);

    displayCardDetailsOnButton(lightCard: Card): string {
        if (this.popupContent === 'summary') {
            return `${lightCard.summaryTranslated}`;
        } else {
            const publishDate = DateTimeFormatterService.getFormattedDateAndTime(lightCard.publishDate);
            return `${publishDate} : ${lightCard.titleTranslated}`;
        }
    }

    getExtentWithMargin() {
        const margin = 4000;
        const extent = this.vectorLayer.getSource().getExtent();
        extent[0] = extent[0] - margin;
        extent[1] = extent[1] - margin;
        extent[2] = extent[2] + margin;
        extent[3] = extent[3] + margin;
        return extent;
    }

    getClosePopupOverlay(): Overlay {
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

    static getOpenLayersStyle(
        type: string,
        severity: Severity,
        highlight: boolean,
        highlightPolygonStrokeWidth: number
    ): Style {
        switch (type) {
            case 'Point':
                return OpfabMap.pointStyle(severity, highlight);
            case 'Polygon':
                return OpfabMap.polygonStyle(severity, highlight, highlightPolygonStrokeWidth);
            default:
                logger.error('Unsupported geo type: ' + type);
        }
    }

    updateGraph(lightCards: Card[]) {
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
                    color: OpfabMap.severityToColorMap(0.8)[severity]
                }),
                stroke: new Stroke({
                    color: 'rgba(186, 186, 186, 0.5)',
                    width: 2
                })
            })
        });
    }

    private static polygonStyle(severity: Severity, highlight: boolean, highlightPolygonStrokeWidth: number) {
        const fillOpacity = highlight ? 0.6 : 0.1;
        const strokeWidth = highlight ? highlightPolygonStrokeWidth : 2;
        return new Style({
            stroke: new Stroke({
                color: OpfabMap.severityToColorMap(0.8)[severity],
                width: strokeWidth
            }),
            fill: new Fill({
                color: OpfabMap.severityToColorMap(fillOpacity)[severity] // 'rgba(0, 0, 255, 0.1)'
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
                            return Number(context.dataset.data[context.dataIndex]) > 0;
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
        if (chart?.data) {
            chart.data.datasets.forEach((dataset) => {
                dataset.data = data;
            });
            chart.update();
        }
    }

    isSmallscreen() {
        return window.innerWidth < 1000;
    }

    private convertFlatStyleToOpenLayersStyle(flatStyle: any): Style {
        const styleOptions: any = {};

        if (flatStyle['stroke-color'] || flatStyle['stroke-width']) {
            styleOptions.stroke = new Stroke({
                color: flatStyle['stroke-color'] || 'rgba(0, 0, 0, 1)',
                width: flatStyle['stroke-width'] || 1
            });
        }

        if (flatStyle['fill-color']) {
            styleOptions.fill = new Fill({
                color: flatStyle['fill-color']
            });
        }

        return new Style(styleOptions);
    }

    private addArcGISLayer(layerConfig: any) {
        // Build ArcGIS REST parameters
        const restParams: any = {};

        if (layerConfig.layers) {
            restParams['LAYERS'] = `show:${layerConfig.layers}`;
        }
        if (layerConfig.format) {
            restParams['FORMAT'] = String(layerConfig.format);
        } else {
            restParams['FORMAT'] = 'png';
        }
        // Default to transparent unless explicitly disabled
        restParams['TRANSPARENT'] = layerConfig.transparent === false ? 'false' : 'true';

        // For Lambert 93, add projection info to params to ensure proper coordinate handling
        const projectionConfig = this.getProjectionConfig();
        if (projectionConfig.mapProjection === 'EPSG:2154') {
            // ArcGIS services should handle projection automatically, but we can add it as a parameter if needed
            restParams['outSR'] = '2154'; // Spatial Reference for Lambert 93
        }

        const imageArcGISSource = new ImageArcGISRest({
            url: layerConfig.url,
            params: restParams,
            ratio: layerConfig.ratio ?? 1,
            crossOrigin: 'anonymous'
        });

        const imageLayer = new ImageLayer({
            source: imageArcGISSource,
            opacity: layerConfig.opacity !== undefined ? layerConfig.opacity : 1,
            visible: layerConfig.visible !== false,
            zIndex: layerConfig.zIndex !== undefined ? layerConfig.zIndex : 0
        });

        this.map.addLayer(imageLayer);
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
