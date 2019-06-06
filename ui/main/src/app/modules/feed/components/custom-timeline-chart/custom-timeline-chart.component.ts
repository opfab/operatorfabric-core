import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ViewChild, ElementRef
} from '@angular/core';
import { scaleLinear, scaleTime } from 'd3-scale';
import * as _ from 'lodash';
import {
  BaseChartComponent,
  calculateViewDimensions,
  ChartComponent,
  ViewDimensions
} from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {XAxisTickFormatPipe} from "../time-line/x-axis-tick-format.pipe";

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
      <svg:rect *ngIf="realTimeBar && checkInsideDomain(xRealTimeLine)"
                [attr.x]="timeScale(xRealTimeLine)"
                [attr.width]="5"
                y="0"
                [attr.fill]="'blue'"
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
         
          <text *ngIf="checkInsideDomain(myCircle.date)" [attr.x]="timeScale(myCircle.date)" [attr.y]="yScale(myCircle.value)" stroke="#000000" text-anchor="middle" stroke-width="1px" [attr.font-size]="13" dy=".3em"> {{myCircle.count}} </text>
        </svg:g>
      </svg:g>
    </svg:g>
    <ng-template #tooltipTemplate2>
      {{circleHovered.period}} <br/>
      Count: {{circleHovered.count}} <br/>
    </ng-template>
  </ngx-charts-chart>`,
  styleUrls: ['./custom-timeline-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomTimelineChartComponent extends BaseChartComponent {
  // ----W----
  // stroke-width 1px font-size 10 J7
  // stroke-width 1px font-size 13 J10
  // stroke-width 2px font-size 16 J14
  /*               [tooltipTitle]="myCircle.date"
  */
  // ----M----
  // stroke-width 2px font-size 16 M1
  // stroke-width 2px font-size 16 M1 J15
  // stroke-width 1px font-size 13 M2

  // ----Y----
  // stroke-width 2px font-size 22 Y1 26 normal 30 big
  // stroke-width 2px font-size 16 Y1 M6
  // stroke-width 1px font-size 13 Y2

  // Domain
  @Input()
  set valueDomain(value: any) {
    this.xDomain = value;
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
  // Axis
  @Input() xAxis;
  @Input() yAxis;

  // realTimeBar
  @Input() realTimeBar = false;
  // Y axis domain
  @Input() autoScale = false;
  // On axis the tick display line
  @Input() showGridLines = true;

  // Unknown yet
  @Input() gradient;
  @Input() animations = true;

  // Zoom
  @Input() enableZoom = false;
  @Input() zoomOnButton = true;
  @Input() zoomSpeed = 0.1;
  @Input() minZoomLevel = 0.1;
  @Input() maxZoomLevel = 4.0;

  // Drag
  @Input() enableDrag = true;

  // Circle
  @Input() circleDiameter;

  // TICKS
  oneOnTwo = 1;
  xTicks = [];
  xTicksOne = [];
  xTicksTwo = [];
  yTicks = [];
  @Input() centeredOnTicks = true;
  @Input() clusterLevel;

  // Zoom (manage home btn when domain change inside this component)
  @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>();

  // MUST
  @ViewChild(ChartComponent, { read: ElementRef }) chart: ElementRef;

  dims: ViewDimensions;
  xDomain: any;
  yDomain: any;
  yScale: any;
  xAxisHeight = 0;
  yAxisWidth = 0;
  timeScale: any;
  margin: any[] = [10, 20, 10, 0];
  transform: string;
  transform2: string;
  xRealTimeLine = moment();

  circleHovered = {
    period: '',
    count: 0
  };

  // DATA
  private _myData;
  public dataClustered;
  private first = true;

  // ZOOM
  maxZoom;
  minZoom;
  private _zoomLevel;

  // DRAG
  startDragX;
  setDragDirection;
  dragDirection;
  previousXPos;

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

    if (this.first) {
      this.first = false;
      this.updateRealTimeDate();
      // set inside ngx-charts verticalSpacing variable to 10
      for (let i = 0; i < 50; i++) {
        this.xTicksOne.push('Library need to rotate ticks one time for set verticalSpacing to 10 on ngx-charts-x-axis-ticks');
        this.xTicksTwo.push('Library need to rotate ticks one time for set verticalSpacing to 10 on ngx-charts-x-axis-ticks');
      }
    }
  }

  hideLabelsTicks = (e): string => {
    if (!this.autoScale) {
      return '';
    } else {
      return e;
    }
  }

  updateRealTimeDate(): void {
    this.xRealTimeLine = moment();
    setTimeout(() => {
      this.updateRealTimeDate();
    }, 3000);
  }

  /**
   * return true when date is inside the domain
   */
  checkInsideDomain(date): boolean {
    const domain = this.getXDomain();
    return date >= domain[0] && date <= domain[1];
  }

  /**
   * set circleHovered property period
   * with the first and last date in the group of value which create circle
   */
  feedCircleHovered(myCircle): void {
    this.circleHovered = {
      period: '',
      count: myCircle.count,
    };
    // surement implémenter un autre traitement de string
    if (myCircle.start.valueOf() === myCircle.end.valueOf()) {
      this.circleHovered.period = 'Date : ' + this.fctHoveredCircleDateFormatting(myCircle.start);
    } else {
      this.circleHovered.period = 'Periode : ' + this.fctHoveredCircleDateFormatting(myCircle.start) +
          ' - ' + this.fctHoveredCircleDateFormatting(myCircle.end);
    }
  }

  /**
   * when timeline is clicked init all drag variables
   * @param $event
   */
  onDragStart($event: MouseEvent): void {
    this.startDragX = $event.clientX;
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
    const result = this.timeScale.invert(mouseX / 10).getTime() - this.timeScale.invert(this.startDragX / 10).getTime();
    const myDomain2 = this.valueDomain;
    this.xDomain = [(myDomain2[0] - result), (myDomain2[1] - result)];
    this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);
    // keep mouse X position
    this.previousXPos = mouseX;
    this.zoomChange.emit('drag');
    return;
  }

  @Input()
  set zoomLevel(level) {
    this._zoomLevel = Number(level);
  }
  get zoomLevel() {
    return this._zoomLevel;
  }

  /**
   * zoom on timeline
   * @param $event
   * @param direction
   */
  onZoom($event: MouseEvent, direction): void {
    if (!this.enableZoom) {
      return;
    }

    if (this.zoomOnButton) {
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
   * Set xDomain with the minimum and Maximum date inside the array of this.myData
   */
  getXDomain(): number[] {
    // if it's already set, return it
    if (this.xDomain) {
      return this.xDomain;
    }
    return [0, 1];
    /* INUTILE SI L'CONF PAR DEFAULT LE DOMAIN */
    // Stack on values array all the date of our data
/*
    const values = [];
    for (const series of this.myData) {
      for (const d of series) {
        if (!values.includes(d.date)) {
          values.push(d.date);
        }
      }
    }
    let domain: number[];
    const min = moment(Math.min(...values));
    min.hours(0).minutes(0).seconds(0).milliseconds(0);
    const max = moment(Math.max(...values));
    max.hours(0).minutes(0).seconds(0).milliseconds(0);
    domain = [min.valueOf(), max.valueOf()];
    return domain;
*/

    /* FINNN */
  }

  /**
   * format the ticks string format (ex: 04/07/19)
   */
  fctTickFormatting = (e): string => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    return formatPipe.transform(e, 'en-US', this.clusterLevel);
  }

  /**
   * format the ticks string format (ex: 04/07/19)
   */
  fctTickFormattingAdvanced = (e): string => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    if (this.clusterLevel === 'W') {
      return formatPipe.transformAdvanced(e, 'en-US', this.clusterLevel);
    }
    return formatPipe.transform(e, 'en-US', this.clusterLevel);
  }

  /**
   * format the date of the hovered circle
   */
  fctHoveredCircleDateFormatting(e): string {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    return formatPipe.transformHovered(e, 'en-US', this.clusterLevel);
  }

  /**
   * define for a week until 2 weeks the number and the value of ticks on xAxis
   */
  weekTicks(domain): void {
    const startDomain = moment(domain[0]);
    // check if the domain is superior to 10 days
    /*if ((domain[1] - domain[0]) > (10 * 24 * 3600 * 1000)) {
      let nextDay = moment(startDomain);
      for (let i = 0; nextDay.valueOf() < domain[1]; i++) {
        nextDay = moment(startDomain);
        nextDay.add((i * 6), 'hours');
        this.xTicks.push(nextDay);
      }
    } else {*/
      let nextDay = moment(startDomain);
      for (let i = 0; nextDay.valueOf() < domain[1]; i++) {
        nextDay = moment(startDomain);
        nextDay.add((i * 4), 'hours');
        this.xTicks.push(nextDay);
      }
    //}
  }

  /**
   * define for a month until 2 months the number and the value of ticks on xAxis
   */
  monthTicks(domain): void {
    const startDomain = moment(domain[0]);
    // check if the domain is superior to 45 days
    /*if ((domain[1] - domain[0]) > (45 * 24 * 3600 * 1000)) {
      let nextWeek = moment(startDomain);
      for (let i = 0; nextWeek.valueOf() < domain[1]; i++) {
        nextWeek = moment(startDomain);
        nextWeek.add((i), 'days');
        this.xTicks.push(nextWeek);
        i++;
      }
      // close the domain when ticks go to far compare to domain
      if (this.xTicks[this.xTicks.length - 1] > domain[1]) {
        this.xTicks.pop();
        this.xTicks.push(moment(domain[1]));
      }
    } else {*/
      let nextWeek = moment(startDomain);
      for (let i = 0; nextWeek.valueOf() < domain[1]; i++) {
        nextWeek = moment(startDomain);
        nextWeek.add((i), 'days');
        this.xTicks.push(nextWeek);
      }
    //}
  }


  /**
   * define for a year until 2 years the number and the value of ticks on xAxis
   */
  yearTicks(domain): void {
    const startDomain = moment(domain[0]);
    let nextMonth = moment(startDomain);
    let i = 0;
    // until the end of our domain, push one tick for the 1st day of each month
    while (nextMonth.valueOf() < domain[1]) {
      nextMonth = moment(startDomain).date(1);
      nextMonth.add(i, 'months');
      this.xTicks.push(nextMonth);
      const halfMonth = moment(nextMonth);
      halfMonth.date(16);
      this.xTicks.push(halfMonth);
      i++;
      // i++ example ticks sur deux lignes
      /*i++;
      i++;*/
    }
    // cause of the half Month ticks push one is after the end of domain
    this.xTicks.pop();
  }

  /**
   * call appropriate function for set Ticks
   * @param domain
   */
  setXTicksValue(domain): void { // rajouter width et faire différent traitement (responsive)
    switch (this.clusterLevel) {
      case 'W': {
        this.weekTicks(domain);
        break;
      }
      case 'M': {
        this.monthTicks(domain);
        break;
      }
      case 'Y': {
        this.yearTicks(domain);
        break;
      }
      default : {
        break;
      }
    }
  }

  /**
   * return scaleTime function after called set X Ticks and Cluster functions
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

  getYDomain(): number[] {
    const domain = [];

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
   * return scaleY function after set Y Ticks
   * @param domain
   * @param height
   */
  getYScale(domain, height): any {
    this.yTicks = [];
    this.setYTicks();
    const scaleY = scaleLinear()
        .range([height, 0])
        .domain(domain);
    return scaleY;
  }

  /**
   * update the width of the chart
   * set new x Axis Width and call update function
   * @param width
   */
  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  /**
   * update the height of the chart
   * set new x Axis Height and call update function
   * @param height
   */
  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  multiHorizontalTicksLine(pos: number) {
    const newList = [];
    if (pos === 1) {
      for (let i = 0; i < this.xTicks.length; i++) {
        if (i % 2 === 0) {
          newList.push(this.xTicks[i]);
        }
      }
    } else if (pos === 2) {
      for (let i = 0; i < this.xTicks.length; i++) {
        if (i % 2 === 1) {
          newList.push(this.xTicks[i]);
        }
      }
    } else if (pos === 3) {
      return this.xTicks;
    } else if (pos === 4) {
      for (let i = 0; i < this.xTicks.length; i++) {
        if (i % 6 === 0) {
          newList.push(this.xTicks[i]);
        }
      }
    }
    return newList;
  }

  /**
   * set X Ticks and Clusterize data
   * @param domain
   */
  setTicksAndClusterize(domain): void {
    this.setXTicksValue(domain);
    this.xTicksOne = [];
    this.xTicksTwo = [];
    if (this.clusterLevel === 'W') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(4);
    } else {
      this.xTicksOne = this.multiHorizontalTicksLine(1);
      this.xTicksTwo = this.multiHorizontalTicksLine(2);
    }
    this.clusterize(domain);
  }

  /**
   * set Y Ticks
   * one ticks by severity
   */
  setYTicks(): void {
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


  /*
  !!!! Make special case for begin
       actually first circle are from first tick to half of next interval ticks
       0 to 1.5
     */
  clusterize(domain) {
    console.log('CLUSTERIZE : Domain', domain);
    this.dataClustered = [];
    let y = 0;
    for (const array of this._myData) { // array = [red, red, red]
      let j = 0; // array[j] = red
      this.dataClustered.push([]);
      if (array.length > 0) {
        // move array to begin of ticks time
        while (array[j] && (array[j].date < this.xTicks[0]) && (j < array.length)) {
          j++;
        }
      }
      if (j < array.length) {
        // for all ticks check if array[j] is in the interval
        for (let i = 1; i < this.xTicks.length; i++) {
          if (array[j]) {
            let feedIt = false;
            let circleDate;
            // set the new position for the circle group
            // Two Case : on ticks or in middle of two ticks
            if (this.centeredOnTicks) {
              circleDate = this.xTicks[i].valueOf();
            } else {
              circleDate = this.xTicks[i - 1].valueOf() + ((this.xTicks[i].valueOf() - this.xTicks[i - 1].valueOf()) / 2);
            }
            const newDate = moment(circleDate);
            // initialisation a new circle
            // it's push on our new Data List only if is inside the interval
            const newCircle = {
              start: moment(array[j].date),
              end: moment(array[j].date),
              date: newDate, // a calibrer entre deeux
              count: 0,
              color: array[j].color,
              cy: array[j].cy,
              value: array[j].value,
              r: this.circleDiameter, // array[j].r
              // W2 7 D10 12 W1 16
              // M2 12 D45 16 M1 20
              // Y2 12 D180 16 Y1 24
            };
            let startLimit: number;
            let endLimit: number;
            // Group Algo 1
            if (this.centeredOnTicks) {
              startLimit = this.xTicks[i] - ((this.xTicks[i] - this.xTicks[i - 1]) / 2);
              /* !!!! Make special case for begin
                 actually first circle are from first tick to half of next interval ticks
                  0 to 1.5 */
              if (i === 1) {
                startLimit = this.xTicks[i - 1];
              }
              // Last tick has is own value for endLimit;
              if (i + 1 === this.xTicks.length) {
                endLimit = this.xTicks[i].valueOf();
              } else {
                endLimit = this.xTicks[i] + ((this.xTicks[i + 1] - this.xTicks[i]) / 2);
              }
            } else { // Group Algo 2
              startLimit = this.xTicks[i - 1];
              // !!! actually the domain[1], last value of ticks, it's exclude !!!
              endLimit = this.xTicks[i];

            }
            while (array[j] && startLimit <= array[j].date && array[j].date < endLimit) {
              const newValue = newCircle.count + array[j].count;
              feedIt = true;
              newCircle.count = newValue;
              newCircle.end = array[j].date;
              j++;
            }
            if (feedIt) {
              this.dataClustered[y].push(_.cloneDeep(newCircle));
              console.log('feed HERE');
            }
          }
        }
      }
      y++;
    }
  }
}
