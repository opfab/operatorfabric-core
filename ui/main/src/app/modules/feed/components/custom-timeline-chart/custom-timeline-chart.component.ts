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
import {XAxisTickFormatPipe} from '../time-line/x-axis-tick-format.pipe';

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
         
          <text *ngIf="checkInsideDomain(myCircle.date) && myCircle.count < 100" [attr.x]="timeScale(myCircle.date)" [attr.y]="yScale(myCircle.value)" stroke="#000000" text-anchor="middle" stroke-width="1px" [attr.font-size]="13" dy=".3em"> {{myCircle.count}} </text>
          <text *ngIf="checkInsideDomain(myCircle.date) && myCircle.count > 99" [attr.x]="timeScale(myCircle.date)" [attr.y]="yScale(myCircle.value)" stroke="#000000" text-anchor="middle" stroke-width="1px" [attr.font-size]="13" dy=".3em"> +99 </text>
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

  // Drag
  @Input() enableDrag;

  // Circle
  @Input() circleDiameter;

  // TICKS
  @Input() centeredOnTicks;
  @Input() clusterLevel;
  private xTicks = [];
  public xTicksOne = [];
  public xTicksTwo = [];
  public yTicks = [];

  // Zoom (manage home btn when domain change inside this component)
  @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>();

  // MUST
  @ViewChild(ChartComponent, { read: ElementRef }) chart: ElementRef;

  public dims: ViewDimensions;
  public xDomain: any;
  public yDomain: any;
  public yScale: any;
  private xAxisHeight = 0;
  private yAxisWidth = 0;
  public timeScale: any;
  private margin: any[] = [10, 20, 10, 0];
  public transform: string;
  public transform2: string;
  public xRealTimeLine = moment();

  public circleHovered = {
    period: '',
    count: 0
  };

  // DATA
  private _myData;
  public dataClustered;
  private first = true;

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
   * Main function for ngx-charts
   * Called for each update on chart
   * set chart dimension and chart domains
   * set chart scales and translate (add margin arround chart)
   *
   * Only first time :
   *  - call loop function for display real time bar
   *  - set xTicks for rotate it, and set a variable inside library
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

    if (this.first) {
        this.first = false;
        if (this.realTimeBar) {
          this.updateRealTimeDate();
        }
        // set inside ngx-charts library verticalSpacing variable to 10
        // Library need to rotate ticks one time for set verticalSpacing to 10 on ngx-charts-x-axis-ticks
        for (let i = 0; i < 50; i++) {
            this.xTicksOne.push(moment(i));
            this.xTicksTwo.push(moment(i));
        }
    }
  }

  /**
   * hide ticks display when autoScale is false
   * return the ticks value display
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
   * xRealTimeLine is a vertical bar which represent the actual time
   */
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
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    return formatPipe.transform(e, this.clusterLevel);
  }

  /**
   * format the ticks string (ex: 04/07/19)
   * in special zoom level (W) format differently the ticks string
   */
  fctTickFormattingAdvanced = (e): string => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    if (this.clusterLevel === 'W' || this.clusterLevel === 'D-7') {
      return formatPipe.transformAdvanced(e, this.clusterLevel);
    }
    return formatPipe.transform(e, this.clusterLevel);
  }

  /**
   * format the date of the hovered circle
   */
  fctHoveredCircleDateFormatting(e): string {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    return formatPipe.transformHovered(e, this.clusterLevel);
  }

  /**
   * define for a week until 2 weeks the number and the value of ticks on xAxis
   * from start of domain place a tick all the four hours
   */
  weekTicks(domain): void {
    const startDomain = moment(domain[0]);
    let nextDay = moment(startDomain);
    for (let i = 0; nextDay.valueOf() < domain[1]; i++) {
      nextDay = moment(startDomain);
      nextDay.add((i * 4), 'hours');
      this.xTicks.push(nextDay);
    }
    console.log(this.xTicks);
  }

  /**
   * define for a month until 2 months the number and the value of ticks on xAxis
   * from start of domain place a tick all the day
   */
  monthTicks(domain): void {
    const startDomain = moment(domain[0]);
    let nextWeek = moment(startDomain);
    for (let i = 0; nextWeek.valueOf() < domain[1]; i++) {
      nextWeek = moment(startDomain);
      nextWeek.add((i), 'days');
      this.xTicks.push(nextWeek);
    }
  }


  /**
   * define for a year until 2 years the number and the value of ticks on xAxis
   * from start of domain place two ticks all the months : 1st & 16th day of the month
   */
  yearTicks(domain): void {
    const startDomain = moment(domain[0]);
    let nextMonth = moment(startDomain);
    let i = 0;
    // when not starting by begin of month, first write 16th day tick
    if (nextMonth.date() >= 16) {
      this.xTicks.push(nextMonth.date(16));
      i++;
    }
    // until the end of our domain, push one tick for the 1st & 16th day of each month
    while (nextMonth.valueOf() < domain[1]) {
      nextMonth = moment(startDomain).date(1);
      nextMonth.add(i, 'months');
      this.xTicks.push(nextMonth);
      const halfMonth = moment(nextMonth);
      halfMonth.date(16);
      this.xTicks.push(halfMonth);
      i++;
    }
    // cause of the half Month ticks push one is after the end of domain
    this.xTicks.pop();
  }

  /**
   * call appropriate function for set Ticks according to cluster level
   * @param domain
   */
  setXTicksValue(domain): void { // add width and make différent treatment (responsive)
    switch (this.clusterLevel) {
      case 'W': case 'D-7': {
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
   * return scaleTime (xScale) function after called set X Ticks and Cluster functions
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
   * return static domain for initialisation
   * return a domain with the minimum and Maximum date inside the arrays of this.myData
   */
  getXDomain(): number[] {
    // if it's already set, return it
    if (this.xDomain) {
      return this.xDomain;
    }
    return [0, 1];
    // Not use on Let's Co, commented for Unit Test
    /*    // Stack on values array all the date of our data

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
  }

  /**
   * if autoScale is false return static domain of 4 raw
   * return a domain with rows equal to the number of array inside this.myData
   */
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
   * 3 : return tick value every six xTicks' ticks
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
          /*if (i % 6 === 0) {
            newList.push(this.xTicks[i]);
          }*/
          if (this.xTicks[i].hours() === 0) {
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
   * set the x ticks value
   * set the two x ticks displayed lists
   * call clusterize function
   * @param domain
   */
  setTicksAndClusterize(domain): void {
    this.setXTicksValue(domain);
    this.xTicksOne = [];
    this.xTicksTwo = [];
    if (this.clusterLevel === 'W' || this.clusterLevel === 'D-7') {
      this.xTicksOne = this.multiHorizontalTicksLine(3);
      this.xTicksTwo = this.multiHorizontalTicksLine(4);
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
    let y = 0;
    // loop on arrays (each severities) of our data
    for (const array of this._myData) {
      let firstPass = true;
      let j = 0;
      this.dataClustered.push([]);
      if (array.length > 0) {
        // move cursor to begin of ticks time
        while (array[j] && (array[j].date < this.xTicks[0]) && (j < array.length)) {
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
              circleDate = this.xTicks[i].valueOf();
            } else {
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
              r: this.circleDiameter, // array[j].r
            };
            let startLimit: number;
            let endLimit: number;
            // Group Algo 1
            if (this.centeredOnTicks) {
              // begin special case:
              // first tick has is own value for startLimit
              // endLimit has half of 2nd tick
              // set i to 0 for one more loop
              if (firstPass) {
                firstPass = false;
                i = 0;
                newCircle.date = moment(this.xTicks[i].valueOf());
                startLimit = this.xTicks[i];
                endLimit = this.xTicks[i] + ((this.xTicks[i + 1] - this.xTicks[i]) / 2);
              } else {
                // startLimit set with half of the interval between the actual and previous ticks
                startLimit = this.xTicks[i] - ((this.xTicks[i] - this.xTicks[i - 1]) / 2);
                // last tick has is own value for endLimit
                if (i + 1 === this.xTicks.length) {
                  endLimit = this.xTicks[i] + 1;
                } else {
                  // endLimit set with half of the interval between the actual and next ticks
                  endLimit = this.xTicks[i] + ((this.xTicks[i + 1] - this.xTicks[i]) / 2);
                }
              }
            } else { // Group Algo 2
              startLimit = this.xTicks[i - 1];
              // !!! actually the domain[1], last value of ticks, it's exclude !!!
              endLimit = this.xTicks[i] + 1; // check +1 if it's working

            }
            // add value of array[j] if his date is inside the interval make by start and end limit
            while (array[j] && startLimit <= array[j].date && array[j].date < endLimit) {
              const newValue = newCircle.count + array[j].count;
              feedIt = true;
              newCircle.count = newValue;
              newCircle.end = array[j].date;
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
