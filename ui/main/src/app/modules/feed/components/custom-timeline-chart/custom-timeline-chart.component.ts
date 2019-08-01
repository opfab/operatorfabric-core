import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {scaleLinear, scaleTime} from 'd3-scale';
import * as _ from 'lodash';
import {BaseChartComponent, calculateViewDimensions, ChartComponent, ViewDimensions} from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {XAxisTickFormatPipe} from '../time-line/x-axis-tick-format.pipe';
import {TimeService} from '@ofServices/time.service';

@Component({
  selector: 'of-custom-timeline-chart',
  template: `<ngx-charts-chart
    [view]="[width, height]" xmlns:svg="http://www.w3.org/1999/svg"
    [showLegend]="false"
    [animations]="animations"
    appMouseWheel
    (mouseWheelUp)="onZoom($event, 'in')"
    (mouseWheelDown)="onZoom($event, 'out')"
    appDraggable
    (dragStart)="onDragStart($event)"
    (dragMove)="onDragMove($event)"
    class="">
    <svg:g [attr.transform]="transform" class="chart">
      <svg:g ngx-charts-x-axis
             *ngIf="xAxis"
             [xScale]="timeScale"
             [dims]="dims"
             [showGridLines]="showGridLines"
             [tickFormatting]="fctTickFormattingAdvanced"
             [ticks]="xTicksOne"
             (dimensionsChanged)="updateXAxisHeight($event)">
      </svg:g>

      <svg:g [attr.transform]="transform2">
        <svg:g ngx-charts-x-axis-ticks
               *ngIf="xAxis"
               [scale]="timeScale"
               [showGridLines]="showGridLines"
               [gridLineHeight]="dims.height"
               [tickFormatting]="fctTickFormatting"
               [width]="dims.width"
               [tickValues]="xTicksTwo"
               (dimensionsChanged)="updateXAxisHeight($event)"
        />
      </svg:g>
      <svg:g ngx-charts-y-axis
                    *ngIf="yAxis"
                    [yScale]="yScale"
                    [dims]="dims"
                    [tickFormatting]="hideLabelsTicks"
                    [ticks]="yTicks"
                    [showGridLines]="showGridLines"
                    (dimensionsChanged)="updateYAxisWidth($event)">
      </svg:g>
      <text *ngIf="realTimeBar && checkInsideDomain(xRealTimeLine) && !underDayPeriod"
            [attr.x]="timeScale(xRealTimeLine)"
            [attr.y]="-10" stroke="'grey'"
            [attr.fill]="'grey'"
            text-anchor="middle" stroke-width="1px"
            [attr.font-size]="11" dy=".3em"> {{timeService.predefinedFormat(xRealTimeLine, 'realTimeBarFormat')}}</text>
      <text *ngIf="underDayPeriod"
            [attr.x]="50"
            [attr.y]="-10" stroke="'black'"
            [attr.fill]="'black'"
            text-anchor="middle" stroke-width="1px"
            [attr.font-size]="12" dy=".3em"> {{dateFirstTick}}</text>
      <svg:rect *ngIf="realTimeBar && checkInsideDomain(xRealTimeLine)"
                [attr.x]="timeScale(xRealTimeLine)"
                [attr.width]="5"
                y="0"
                [attr.fill]="'grey'"
                [attr.height]="dims.height"
                class="realTimeLine"
      ></svg:rect>
      <svg:g *ngFor="let series of dataClustered">
        <svg:g *ngFor="let myCircle of series"
               (mouseenter)="feedCircleHovered(myCircle)"
               ngx-tooltip
               [tooltipTemplate]="tooltipTemplate2">
          <svg:circle *ngIf="checkInsideDomain(myCircle.date)"
                      [attr.cx]="timeScale(myCircle.date)"
                      [attr.cy]="yScale(myCircle.value)"
                      [attr.r]="myCircle.r"
                      [attr.fill]=myCircle.color
                      [attr.stroke]="myCircle.stroke"
                      [attr.opacity]="0.7"
          />
          <text *ngIf="checkInsideDomain(myCircle.date) && myCircle.count < 100"
                [attr.x]="timeScale(myCircle.date)" [attr.y]="yScale(myCircle.value)"
                stroke="#000000" text-anchor="middle" stroke-width="1px" [attr.font-size]="13" dy=".3em"> {{myCircle.count}} </text>
          <text *ngIf="checkInsideDomain(myCircle.date) && myCircle.count > 99"
                [attr.x]="timeScale(myCircle.date)" [attr.y]="yScale(myCircle.value)"
                stroke="#000000" text-anchor="middle" stroke-width="1px" [attr.font-size]="13" dy=".3em"> +99 </text>
        </svg:g>
      </svg:g>
    </svg:g>
    <ng-template #tooltipTemplate2>
      {{circleHovered.period}} <br/>
      Count: {{circleHovered.count}} <br/>
      Summary: <p *ngFor="let title of circleHovered.summary"style="padding: 0px;margin: 0px;line-height: 10px">{{title}}</p>
    </ng-template>
  </ngx-charts-chart>`,
  styleUrls: ['./custom-timeline-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomTimelineChartComponent extends BaseChartComponent implements OnInit {
  /**
   * add time service at this component
   * init all variables
   * @param chartElement
   * @param zone
   * @param cd
   * @param time
   */
  constructor(chartElement: ElementRef, zone: NgZone, cd: ChangeDetectorRef, public timeService: TimeService) {
    super(chartElement, zone, cd);
    this.xTicks = [];
    this.xTicksOne = [];
    this.xTicksTwo = [];
    this.yTicks = [];
    this.xAxisHeight = 0;
    this.yAxisWidth = 0;
    this.margin = [10, 20, 10, 0];
    this.realTimeBar = moment();
    this.circleHovered = {
      period: '',
      count: 0,
      summary: []
    };
    this.underDayPeriod = false;
  }

  // Domain
  @Input()
  set valueDomain(value: any) {
    this.xDomain = value;
    // allow to show on top left of component date of first tick (same as xDomain[0])
    this.underDayPeriod = false;
    const millisecondsDomain = value[1] - value[0];
    if (millisecondsDomain < 3600001) { // 1 Hour
      this.underDayPeriod = true;
      this.dateFirstTick = moment(value[0]).format('ddd DD MMM YYYY HH') + 'h';
    } else if (millisecondsDomain < 86400000) { // 1 Day
      this.underDayPeriod = true;
      this.dateFirstTick = this.timeService.predefinedFormat(moment(value[0]), 'dateInsideTooltipsMonth');
    }
  }
  get valueDomain() {
    return this.xDomain;
  }
  // Data
  @Input()
  set myData(value: any) {
    this._myData = _.cloneDeep(value);
  }
  get myData() {
    return this._myData;
  }
  // formatting and ticks spacing
  @Input() clusterConf;
  public clusterLevel;
  // Axis
  @Input() xAxis;
  @Input() yAxis;
  // realTimeBar
  @Input() realTimeBar;
  // Y axis domain
  @Input() autoScale;
  // On axis the tick display line perpendicularly of axis
  @Input() showGridLines;
  // Unknown yet
  @Input() gradient;
  @Input() animations;
  // Zoom
  @Input() enableZoom;
  @Input() zoomOnButton;
  @Input()
  set zoomLevel(level) {
    this._zoomLevel = Number(level);
  }
  get zoomLevel() {
    return this._zoomLevel;
  }
  // manage home btn when domain change inside this component
  @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>();
  // Movement
  @Input() followClockTick;
  // Drag
  @Input() enableDrag;
  // Circle
  @Input() circleDiameter;
  // TICKS
  @Input() centeredOnTicks;
  @Input() clusterTicksToTicks;
  @Input() formatTicks;
  @Input() formatTooltipsDate;
  public xTicks: Array<any>;
  public xTicksOne: Array<any>;
  public xTicksTwo: Array<any>;
  public yTicks: Array<any>;
  public formatLevel: string;
  public underDayPeriod: boolean;
  public dateFirstTick: string;
  // MUST
  @ViewChild(ChartComponent, { read: ElementRef }) chart: ElementRef;
  public dims: ViewDimensions;
  public xDomain: any;
  public yDomain: any;
  public yScale: any;
  private xAxisHeight: number;
  private yAxisWidth: number;
  public timeScale: any;
  private margin: any[];
  public transform: string;
  public transform2: string;
  public xRealTimeLine: moment.Moment;
  // TOOLTIP
  public circleHovered;
  // DATA
  private _myData;
  public dataClustered;
  // ZOOM
  private maxZoom;
  private minZoom;
  private _zoomLevel;
  // DRAG
  private startDragX;
  private setDragDirection;
  public dragDirection;
  private previousXPos;

  /**
   *  - call loop function for update real time bar value
   *  - set xTicks for rotate it, and set a variable inside library
   */
  ngOnInit(): void {
    if (this.realTimeBar || this.followClockTick) {
      this.updateRealTimeDate();
    }
    // set inside ngx-charts library verticalSpacing variable to 10
    // Library need to rotate ticks one time for set verticalSpacing to 10 on ngx-charts-x-axis-ticks
    for (let i = 0; i < 100; i++) {
      this.xTicksOne.push(moment(i));
      this.xTicksTwo.push(moment(i));
    }
  }

  /**
   * Main function for ngx-charts
   * called for each update on chart
   * set chart dimension and chart domains
   * set chart scales and translate (add margin arround chart)
   */
  update(): void {
    super.update();
    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showLegend: false,
      legendType: 'time'
    });
    this.xDomain = this.getXDomain();
    this.yDomain = this.getYDomain();
    this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);
    this.transform = `translate(${ this.dims.xOffset } , ${ this.margin[0] })`;
    this.transform2 = `translate(0, ${ this.dims.height + 15})`;
    console.log('update');
  }

  /**
   * return the ticks value displayed:
   * hide ticks display when autoScale is false
   * or return the value received
   * @param e
   */
  hideLabelsTicks = (e): string => {
    if (!this.autoScale) {
      return '';
    } else {
      return e;
    }
  }

  /**
   * loop function for set xRealTimeLine at the actual time
   * xRealTimeLine is a vertical bar which represent the current time
   * update the domain if check follow clock tick is true
   */
  updateRealTimeDate(): void {
    if (this.realTimeBar) {
      this.xRealTimeLine = moment();
    }
    if (this.followClockTick) {
      if (this.checkFollowClockTick()) {
        this.update();
      }
    }
    setTimeout(() => {
      this.updateRealTimeDate();
    }, 1000);
  }

  /**
   * change domain start with the second tick value
   * if moment is equal to the 4th tick return true
   */
  checkFollowClockTick(): boolean {
    if (this.xTicks && this.xTicks.length > 5) {
      const tmp = moment();
      tmp.millisecond(0);
      // const tmpTick = moment(this.xTicks[4]);
      // tmpTick.millisecond(0);
      if (this.xTicks[4].valueOf() <= tmp.valueOf()) {
          this.valueDomain = [this.xTicks[1].valueOf(), this.xDomain[1] + (this.xTicks[1] - this.xDomain[0])];
          return true;
      }
    }
    return false;
  }

  /**
   * return true when date is inside the domain
   * @param date
   */
  checkInsideDomain(date): boolean {
    const domain = this.getXDomain();
    return date >= domain[0] && date <= domain[1];
  }

  /**
   * set circleHovered properties
   * with first and last date in value group creating circle
   * with summary propriety (card title)
   * @param myCircle
   */
  feedCircleHovered(myCircle): void {
    this.circleHovered = {
      period: '',
      count: myCircle.count,
      summary: [],
    };
    if (myCircle.start.valueOf() === myCircle.end.valueOf()) {
      this.circleHovered.period = 'Date : ' + this.fctHoveredCircleDateFormatting(myCircle.start);
    } else {
      this.circleHovered.period = 'Periode : ' + this.fctHoveredCircleDateFormatting(myCircle.start) +
          ' - ' + this.fctHoveredCircleDateFormatting(myCircle.end);
    }
    this.circleHovered.summary = myCircle.summary;
  }

  /**
   * when timeline is clicked init all drag variables
   * @param $event
   */
  onDragStart($event: MouseEvent): void {
    if ($event) {
      this.startDragX = $event.clientX;
    }
    this.setDragDirection = true;
    this.dragDirection = undefined;
    this.previousXPos = 0;
  }

  /**
   * dragging the timeline
   * @param $event
   */
  onDragMove($event: MouseEvent) {
    if (!this.enableDrag) {
      return;
    }

    if ($event) {
      const mouseX = $event.clientX;
      // set dragDirection to true if mouse go to right side
      // false if mouse go to left
      if (this.setDragDirection) {
        this.dragDirection = (mouseX - this.startDragX) > 0;
        this.setDragDirection = false;
      }
      // check if mouse still going to the same direction
      // if direction differe we change start point position by mouse position (reset algo)
      if (this.dragDirection && (mouseX < this.previousXPos)) {
        this.startDragX = mouseX - 1;
        this.setDragDirection = true;
      } else if (!this.dragDirection && (mouseX > this.previousXPos)) {
        this.startDragX = mouseX + 1;
        this.setDragDirection = true;
      }
      let result = 0;
      if (this.timeScale) {
        result = this.timeScale.invert(mouseX / 10).getTime() - this.timeScale.invert(this.startDragX / 10).getTime();
      }
      const myDomain2 = this.valueDomain;
      this.xDomain = [(myDomain2[0] - result), (myDomain2[1] - result)];
      if (result !== 0) {
        this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);
      }
      // keep mouse X position
      this.previousXPos = mouseX;
      this.zoomChange.emit('drag');
      return;
    } else {
      return;
    }
  }

  /**
   * zoom on timeline : Two modes
   * on buttons : change for next or previous zoom set by buttons conf
   * on chart : using static multiplicator for zooming or unzooming, a maximal and minimal value of zoom is set statically
   * @param $event
   * @param direction
   */
  onZoom($event: MouseEvent, direction): void {
    if (!this.enableZoom) {
      return;
    }
    if (this.zoomOnButton) {
      // active next or previous zoom button
      if (direction === 'in') {
        this.zoomChange.emit('in');
      }
      if (direction === 'out') {
        this.zoomChange.emit('out');
      }
    } else {
      // Not use on Let's Co, commented for Unit Test
      /*this.maxZoom = 104637; // 2 mins: mettre un multiplicateur pr etre reponsive
      this.minZoom = 459344306211715; // 2 mins: mettre un multiplicateur pr etre reponsive

      const mouseX = $event.clientX;
      const cursorXTime = this.timeScale.invert(mouseX - 40).getTime(); // amelio cursorXTime = cercle.date.getTime()
      let myDomain2 = this.valueDomain;
      // use mathematic function:  ==> new Start of domain =  x - (x - domain[0]) / 2
      //                           ==> new End of domain = x + (domain[1] - x) / 2
      if (direction === 'in') {
        if ((myDomain2[1] - myDomain2[0]) > this.maxZoom) {
          const newStart = cursorXTime - ((cursorXTime - myDomain2[0]) / this.zoomLevel);
          const newEnd = cursorXTime + ((myDomain2[1] - cursorXTime) / this.zoomLevel);
          myDomain2 = [newStart, newEnd];
        }
      }
      // same mathematic function: only change division by multiplication
      if (direction === 'out') {
        if ((myDomain2[1] - myDomain2[0]) < this.minZoom) {
          const newStart = cursorXTime - ((cursorXTime - myDomain2[0]) * this.zoomLevel);
          const newEnd = cursorXTime + ((myDomain2[1] - cursorXTime) * this.zoomLevel);
          myDomain2 = [newStart, newEnd];
        }
      }
      this.xDomain = [myDomain2[0], myDomain2[1]];
      // change the domain on xAxis
      this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);*/
    }
  }

  /**
   * format the ticks string (ex: 04/07/19)
   */
  fctTickFormatting = (e): string => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(this.timeService);
    return formatPipe.transform(e, this.formatLevel);
  }

  /**
   * format the ticks string (ex: 04/07/19)
   * in special zoom level (D, Min...) format differently the ticks string
   */
  fctTickFormattingAdvanced = (e): string => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(this.timeService);
    if (this.formatLevel === 'Hou' || this.formatLevel === 'Min' ||
        this.formatLevel === 'Sec' || this.formatLevel === 'nbW') {
      return formatPipe.transformAdvanced(e, this.formatLevel);
    }
    return formatPipe.transform(e, this.formatLevel);
  }

  /**
   * format the date of the hovered circle
   */
  fctHoveredCircleDateFormatting(e): string {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe(this.timeService);
    // when formatTooltipsDate is init, it will format the date with his own value
    if (this.formatTooltipsDate) {
        return formatPipe.transformHovered(e, this.formatTooltipsDate);
    } else {
        return formatPipe.transformHovered(e, this.formatLevel);
    }
  }

  /**
   * for each keys set on ticks configuration object, add the value of this unit
   * date key is skipped
   * @param tmpMoment
   */
  getDateParsedConfCluster(tmpMoment: moment.Moment) {
    Object.keys(this.clusterLevel).forEach(key => {
      // for skip date key, verify type first
      if (typeof this.clusterLevel[key] === 'number' && this.clusterLevel[key] > 0) {
        tmpMoment.add((this.clusterLevel[key]), key);
      }
    });
  }

  /**
   * delete all ticks until the end of domain
   * and push a tick for the end of domain
   * @param domain
   */
  cleanXTicksOffFields(domain): void {
    let j = this.xTicks.length - 1;
    while (j >= 0) {
      if (this.xTicks[j] >= domain[1]) {
        this.xTicks.pop();
      }
      j--;
    }
    this.xTicks.push(moment(domain[1]));
  }

  /**
   * set xTicks:
   * - push the start of domain
   * - push ticks until end of domain by adding time value corresponding of ticks conf
   * - clean extra ticks (tick after end domain)
   * - push the end of domain
   * @param domain
   */
  setXTicksValue(domain): void { // add width and make différent treatment (responsive) +l'autre
    const startDomain = moment(domain[0]);
    this.xTicks.push(startDomain);
    const nextUnit = moment(startDomain);
    while (nextUnit.valueOf() < domain[1]) {
      // special case date : list of day
      // for each date on the list do same implementation, and finish by adding 1 month
      if (this.clusterLevel && this.clusterLevel.date && this.clusterLevel.date.length > 0) {
        this.clusterLevel.date.forEach(op => {
          nextUnit.date(op);
          this.getDateParsedConfCluster(nextUnit);
          const tmp2 = moment(nextUnit);
          if (tmp2 > domain[0]) {
            this.xTicks.push(tmp2);
          }
        });
        nextUnit.add(1, 'month');
      } else {
        this.getDateParsedConfCluster(nextUnit);
        const tmp = moment(nextUnit);
        this.xTicks.push(tmp);
      }
    }
    this.cleanXTicksOffFields(domain);
  }

  /**
   * return scaleTime (xScale) function after called XTicks and Cluster setter functions
   * @param domain
   * @param width
   */
  getTimeScale(domain, width): any {
    this.xTicks = [];
    this.setTicksAndClusterize(domain);
    return scaleTime()
        .range([0, width])
        .domain(domain);
  }

  /**
   * return scaleY function after set Y Ticks
   * @param domain
   * @param height
   */
  getYScale(domain, height): any {
    this.yTicks = [];
    this.setYTicks();
    return scaleLinear()
        .range([height, 0])
        .domain(domain);
  }

  /**
   * return xDomain if it was already set
   * return static domain if no data received
   * return a domain with the minimum and Maximum date inside the arrays of this.myData
   */
  getXDomain(): number[] {
    // if it's already set, return it
    if (this.xDomain) {
      return this.xDomain;
    }
    // Stack on values array all the date property of our data
    const values = [];
    if (this.myData) {
      for (const series of this.myData) {
        for (const d of series) {
          if (!values.includes(d.date)) {
            values.push(d.date);
          }
        }
      }
    } else {
      values.push(0);
      values.push(1);
    }
    let domain: number[];
    const min = moment(Math.min(...values));
    const max = moment(Math.max(...values));
    if (JSON.stringify(values) !== JSON.stringify([0, 1])) {
      min.hours(0).minutes(0).seconds(0).milliseconds(0);
      max.hours(0).minutes(0).seconds(0).milliseconds(0);
    }
    domain = [min.valueOf(), max.valueOf()];
    return domain;
  }

  /**
   * return static domain of 4 raw if autoScale is false
   * return static domain of 4 raw if our data variable is undefined
   * return a domain with rows equal to the number of array inside this.myData
   */
  getYDomain(): number[] {
    const domain = [];
    if (this._myData === undefined) {
      return [0, 5];
    }
    for (const series of this.myData) {
      for (const d of series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }
    let min = Math.min(...domain);
    let max = Math.max(...domain);
    if (!this.autoScale) {
      min = Math.min(0, min);
      max = Math.max(5, max);
    }
    return [min, max];
  }

  /**
   * called when the width of the chart is updated
   * set new y axis width and call update function
   * @param width
   */
  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  /**
   * called when the height of the chart is updated
   * set new x axis height and call update function
   * @param height
   */
  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  /**
   * return a list of ticks made by the parsing of xTicks
   * 1 : return half of xTicks' ticks
   * 2 : return the other half of xTicks' ticks
   * 3 : return xTicks
   * 4 : return tick value every time tick hour = 0
   * 5 : return tick value every time tick minute = 0
   * 6 : return tick value every time tick second = 0
   * 7 : return tick value on first week of the year and every 5 weeks
   * @param pos
   */
  multiHorizontalTicksLine(pos: number) {
    const newList = [];
    switch (pos) {
      case 1: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (i % 2 === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      case 2: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (i % 2 === 1) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      case 3: {
        this.xTicks.forEach(tick => {
          newList.push(tick);
        });
        break;
      }
      case 4: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (this.xTicks[i].hour() === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      case 5: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (this.xTicks[i].minute() === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      case 6: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (this.xTicks[i].second() === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      case 7: {
        for (let i = 0; i < this.xTicks.length; i++) {
          if (this.xTicks[i].week() === 1 || this.xTicks[i].week() % 5 === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      }
      default : {
        break;
      }
    }
    return newList;
  }

  /**
   * set an default format level:
   * run through ticks configuration for find the format moment needed
   */
  setFormatLevel() {
      // Use the more precise unit set on ticks configuration object
      Object.keys(this.clusterLevel).forEach(key => {
        if (key === 'date') {
          this.formatLevel = 'Dat';
        } else if (this.clusterLevel[key] > 0) {
          switch (key) {
            case 'weekNb': {
              this.formatLevel = 'nbW';
              break;
            }
            case 'year': { // change
              this.formatLevel = 'Yea';
              break;
            }
            case 'month': { // change
              this.formatLevel = 'Mon';
              break;
            }
            case 'week': { // change
              this.formatLevel = 'Wee';
              break;
            }
            case 'day': {
              this.formatLevel = 'Day';
              break;
            }
            case 'hour': {
              this.formatLevel = 'Hou';
              break;
            }
            case 'minute': {
              this.formatLevel = 'Min';
              break;
            }
            case 'second': {
              this.formatLevel = 'Sec';
              break;
            }
          }
        }
      });
  }

  /**
   * set format level by configuration passed on formatTicks:
   * when formatTicks is an Array, formatLevel become format value of the more
   * hight width property smaller than window width
   * other case just use formatTicks (string)
   */
  selectFormatTicks() {
    let keepGoing = true;
    if (Array.isArray(this.formatTicks)) {
      this.formatTicks.forEach(oneSet => {
        if (keepGoing) {
          if (oneSet.width <= window.innerWidth) {
            this.formatLevel = _.cloneDeep(oneSet.formatTicks);
            keepGoing = false;
          }
        }
      });
      // if width: 0 wasn't set and screen width is more little than smallest width configuration
      if (keepGoing) {
        this.formatLevel = _.cloneDeep(this.formatTicks[this.formatTicks.length - 1].formatTicks);
      }
    } else {
      this.formatLevel = _.cloneDeep(this.formatTicks);
    }
  }

  /**
   * set cluster level by configuration passed on clusterConf:
   * when clusterConf is an Array, clusterLevel become the tick conf of the more
   * hight width property smaller than window width
   * other case just use clusterConf (Object)
   * @param domain
   */
  setClusterLevel(domain) { // conf celon la taille de l'ecran et la conf
    // use domain for automatic cluster conf
    let keepGoing = true;
    if (this.clusterConf && Array.isArray(this.clusterConf)) {
      this.clusterConf.forEach(oneSet => {
        if (keepGoing) {
          if (oneSet.width <= window.innerWidth) {
            this.clusterLevel = _.cloneDeep(oneSet.conf);
            keepGoing = false;
          }
        }
      });
      // if width: 0 wasn't set and screen width is more little than smallest width configuration
      if (keepGoing) {
        this.clusterLevel = _.cloneDeep(this.clusterConf[this.clusterConf.length - 1].conf);
      }
    } else {
      this.clusterLevel = _.cloneDeep(this.clusterConf);
    }
  }

  /**
   * set cluster level by configuration passed on clusterConf
   * set format level by conf passed on formatTicks or by conf passed on clusterLevel
   * set the x ticks value
   * set the two x ticks displayed lists
   * call clusterize function
   * @param domain
   */
  setTicksAndClusterize(domain): void {
    // clusterLevel defines the ticks configuration used
    this.setClusterLevel(domain);
    if (this.formatTicks) {
      // formatLevel is defined by format ticks configuration (formatTicks)
      this.selectFormatTicks();
    } else {
      // formatLevel is defined by ticks configuration (clusterLevel)
      this.setFormatLevel();
    }
    this.setXTicksValue(domain);
    this.xTicksOne = [];
    this.xTicksTwo = [];
    if (this.formatLevel === 'Hou') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(4);
    } else if (this.formatLevel === 'Min') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(5);
    } else if (this.formatLevel === 'Sec') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(6);
    } else if (this.formatLevel === 'nbW') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(7);
    } else {
      this.xTicksOne = this.multiHorizontalTicksLine(1);
      this.xTicksTwo = this.multiHorizontalTicksLine(2);
    }
    this.clusterize(domain);
  }

  /**
   * set y ticks
   * one ticks by severity
   */
  setYTicks(): void {
    // max = 5 coz Let's Co use
    if (!this.autoScale) {
      if (this.myData) {
        const max = 5; // this.myData.length + 1;
        for (let i = 0; i <= max; i++) {
          this.yTicks.push(i);
        }
      }
    } else {
      this.yTicks = null;
    }
  }

  /**
   * set dataClustered with the data after they be parsed
   * two differents algos :
   *  - circle position are centered on ticks
   *  - circle position are centered between two ticks
   * @param domain
   */
  clusterize(domain): void {
    this.dataClustered = [];
    if (this._myData === undefined || this._myData === []) {
      return;
    }
    let y = 0;
    // loop on arrays (each severities) of our data
    for (const array of this._myData) {
      let firstPass = true;
      let j = 0;
      this.dataClustered.push([]);
      if (array.length > 0) {
        // move cursor to begin of ticks time
        while (array[j] && (array[j].date < domain[0]) && (j < array.length)) {
          j++;
        }
      }
      if (j < array.length) {
        // for all arrays loop on all ticks
        for (let i = 1; i < this.xTicks.length; i++) {
          if (array[j]) {
            let feedIt = false;
            let circleDate;
            // set the new position for the circle group
            // two cases : on ticks or in middle of two ticks
            if (this.centeredOnTicks) {
              if (this.clusterTicksToTicks) {
                circleDate = this.xTicks[i - 1].valueOf();
              } else {
                circleDate = this.xTicks[i].valueOf();
              }
            } else {
              // Circle on middle
              circleDate = this.xTicks[i - 1].valueOf() + ((this.xTicks[i].valueOf() - this.xTicks[i - 1].valueOf()) / 2);
            }

            const newDate = moment(circleDate);
            // initialisation a new circle
            // it's push on our new Data List only if it's inside the interval
            const newCircle = {
              start: moment(array[j].date),
              end: moment(array[j].date),
              date: newDate,
              count: 0,
              color: array[j].color,
              cy: array[j].cy,
              value: array[j].value,
              summary: [],
              r: this.circleDiameter, // array[j].r
            };
            let startLimit: number;
            let endLimit: number;

            if (this.clusterTicksToTicks) { // Group Algo 1
                startLimit = this.xTicks[i - 1].valueOf();
                endLimit = this.xTicks[i].valueOf();
                if (i + 1 === this.xTicks.length) {
                  endLimit = this.xTicks[i].valueOf() + 1;
                }
            } else { // Group Algo 2
            // begin special case:
              // first tick has is own value for startLimit
              // endLimit has half of 2nd tick
              // set i to 0 for one more loop
              if (firstPass) {
                firstPass = false;
                i = 0;
                newCircle.date = moment(this.xTicks[i].valueOf());
                startLimit = this.xTicks[i].valueOf();
                endLimit = this.xTicks[i].valueOf() + ((this.xTicks[i + 1].valueOf() - this.xTicks[i].valueOf()) / 2);
              } else {
                // startLimit set with half of the interval between the actual and previous ticks
                startLimit = this.xTicks[i].valueOf() - ((this.xTicks[i].valueOf() - this.xTicks[i - 1].valueOf()) / 2);
                // last tick has is own value for endLimit
                if (i + 1 === this.xTicks.length) {
                  endLimit = this.xTicks[i].valueOf() + 1;
                } else {
                  // endLimit set with half of the interval between the actual and next ticks
                  endLimit = this.xTicks[i].valueOf() + ((this.xTicks[i + 1].valueOf() - this.xTicks[i].valueOf()) / 2);
                }
              }
            }
            // add value of array[j] if his date is inside the interval make by start and end limit
            while (array[j] && startLimit <= array[j].date && array[j].date < endLimit) {
              const newValue = newCircle.count + array[j].count;
              feedIt = true;
              newCircle.count = newValue;
              newCircle.end = array[j].date;
              const summaryDate = this.timeService.predefinedFormat(moment(array[j].date), 'titleDateInsideTooltips') +
                  ' - ' + this.timeService.predefinedFormat(moment(array[j].date), 'titleHourInsideTooltips') + ' : ' + array[j].summary;
              newCircle.summary.push(summaryDate);
              j++;
            }
            if (feedIt) {
              this.dataClustered[y].push(_.cloneDeep(newCircle));
            }
          }
        }
      }
      y++;
    }
  }
}
