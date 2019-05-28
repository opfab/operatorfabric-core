import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ViewChild, ElementRef
} from '@angular/core';
import { scaleLinear, scaleTime, scaleBand } from 'd3-scale';
import { brushX } from 'd3-brush';
import { select } from 'd3-selection';
import * as _ from 'lodash';
import {
  BaseChartComponent,
  calculateViewDimensions,
  ChartComponent,
  ViewDimensions
} from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {XAxisTickFormatPipe} from "../time-line/x-axis-tick-format.pipe";

// [ticks]="myTicks"
//              [tickFormatting]="fctTickFormatting"

// IMPORTANT TICKS 2nd LINE
/*
<svg:g [attr.transform]="transform2">
  <svg:g ngx-charts-x-axis-ticks
*ngIf="xAxis"
  [scale]="timeScale"
  [showGridLines]="showGridLines"
  [gridLineHeight]="dims.height"
  [tickFormatting]="fctTickFormatting"
  [width]="dims.width"
  [tickValues]="multiHorizontalTicksLine(2)"
(dimensionsChanged)="updateXAxisHeight($event)"
  />
</svg:g>
*/

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
             [tickFormatting]="fctTickFormatting"
             [ticks]="myTicks"
             (dimensionsChanged)="updateXAxisHeight($event)">
      </svg:g>
      <svg:g ngx-charts-y-axis
                    *ngIf="yAxis"
                    [yScale]="yScale"
                    [dims]="dims"
                    [tickFormatting]="hideLabelsTicks"
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
      <a href="https://www.google.com/" target="_blank">
        <button href="https://www.google.com/">erty</button>
      </a>
      {{circleHovered.period}} <br/>
      Count: {{circleHovered.count}} <br/>
    </ng-template>
  </ngx-charts-chart>`,
  styleUrls: ['./custom-timeline-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomTimelineChartComponent extends BaseChartComponent {
  /* <a xlink:href="https://www.google.com" target="_blank">

                    </a>
*/

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
    console.log(this.xDomain, 'valueDomain');
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

  // TICKS
  oneOnTwo = 1;
  myTicks;
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

  // for old clusterize fct
  dateSpanObj;
  colorChecked;

  circleHovered = {
    period: '',
    count: 0
  };


  // DATA
  private _myData;
  private dataClustered;
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

  public nb: number;

  update(): void {
    super.update();
    this.nb = 0;
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
    // this.myData = this.clusterize(this.clusterData);
    console.log('update');

    if (this.first) {
      this.first = false;
      this.updateRealTimeDate();
    }
  }

/*  test3() {
    console.log('k');
  }
*/

  hideLabelsTicks = (e) => {
    return '';
  }

  updateRealTimeDate() {
    this.xRealTimeLine = moment();
    setTimeout(() => {
      this.updateRealTimeDate();
    }, 3000);
  }

  /**
   * return true when date is inside the domain
   */
  checkInsideDomain(date) {
    const domain = this.getXDomain();
    return date >= domain[0] && date <= domain[1];
  }

  /**
   * set circleHovered property period
   * with the first and last date in the group of value which create this circle
   */
  feedCircleHovered(myCircle) {
    this.circleHovered = {
      period: '',
      count: myCircle.count,
    };
    // surement implémenter un autre traitement de string
    if (myCircle.start.valueOf() === myCircle.end.valueOf()) {
      this.circleHovered.period = 'Date : ' + this.fctTickFormatting(myCircle.start);
    } else {
      this.circleHovered.period = 'Periode : ' + this.fctTickFormatting(myCircle.start) + ' - ' + this.fctTickFormatting(myCircle.end);
    }
  }

  // DRAG
  onDragStart($event: MouseEvent) {
    this.startDragX = $event.clientX;
    this.setDragDirection = true;
    this.dragDirection = undefined;
    this.previousXPos = 0;
  }
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
  }

  @Input()
  set zoomLevel(level) {
    this._zoomLevel = Number(level);
  }
  get zoomLevel() {
    return this._zoomLevel;
  }

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
      this.maxZoom = 104637; // 2 mins: mettre un multiplicateur pr etre reponsive
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
      this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);
    }
  }

  // Set xDomain with the minimum and Maximum date inside the array of this.myData
  getXDomain(): any[] {
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

  // format the ticks string format (ex: 04/07/19)
  fctTickFormatting = (e) => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    // renvoie une string
    //  console.log('b', this.myTicks.length);
    return formatPipe.transform(e, 'en-US', this.clusterLevel);
  }


  /*fctTickFormatting2 = (e) => {
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    // renvoie une string
    console.log('fctTickFormatting2', this.myTicks.length);
    if (this.oneOnTwo === 3) {
      this.oneOnTwo = 1;
    } else {
      this.oneOnTwo++;
    }
    return formatPipe.transform2(e, 'en-US', this.clusterLevel, this.oneOnTwo);

    /!*let lkj = 'er';
    lkj = 'lk';
    const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
    lkj = formatPipe.transform(e, 'en-US', this.clusterLevel);
    *!/
    /!*if (this.oneOnTwo === 3) {
      this.oneOnTwo = 1;
      console.log('k');
      const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
      lkj = formatPipe.transform(e, 'en-US', this.clusterLevel);
      // renvoie une string
      // this.multiHorizontalTicksLine(1)
    } else {
      console.log('j');
      this.oneOnTwo++;
    }
    console.log('fin', lkj, this.oneOnTwo);
    return(lkj);*!/
  }
*/
  /**
   * define for a week until 2 weeks the number and the value of ticks on xAxis
   */
  weekTicks(domain) {
    const startDomain = moment(domain[0]);
    // check if the domain is superior to 10 days
    if ((domain[1] - domain[0]) > (10 * 24 * 3600 * 1000)) {
      let nextDay = moment(startDomain);
      for (let i = 0; nextDay.valueOf() < domain[1]; i++) {
        nextDay = moment(startDomain);
        nextDay.add((i * 6), 'hours');
        this.myTicks.push(nextDay);
      }
    } else {
      let nextDay = moment(startDomain);
      for (let i = 0; nextDay.valueOf() < domain[1]; i++) {
        nextDay = moment(startDomain);
        nextDay.add((i * 4), 'hours');
        this.myTicks.push(nextDay);
      }
    }
  }

  /**
   * define for a month until 2 months the number and the value of ticks on xAxis
   */
  monthTicks(domain) {
    const startDomain = moment(domain[0]);
    // check if the domain is superior to 45 days
    if ((domain[1] - domain[0]) > (45 * 24 * 3600 * 1000)) {
      let nextWeek = moment(startDomain);
      for (let i = 0; nextWeek.valueOf() < domain[1]; i++) {
        nextWeek = moment(startDomain);
        nextWeek.add((i), 'days');
        this.myTicks.push(nextWeek);
        i++;
      }
      // close the domain when ticks go to far compare to domain
      if (this.myTicks[this.myTicks.length - 1] > domain[1]) {
        this.myTicks.pop();
        this.myTicks.push(moment(domain[1]));
      }
    } else {
      let nextWeek = moment(startDomain);
      for (let i = 0; nextWeek.valueOf() < domain[1]; i++) {
        nextWeek = moment(startDomain);
        nextWeek.add((i), 'days');
        this.myTicks.push(nextWeek);
      }
    }
  }


  /**
   * define for a year until 2 years the number and the value of ticks on xAxis
   */
  yearTicks(domain) {
    const startDomain = moment(domain[0]);
    let nextMonth = moment(startDomain);
    let i = 0;
    // until the end of our domain, push one tick for the 1st day of each month
    while (nextMonth.valueOf() < domain[1]) {
      nextMonth = moment(startDomain).date(1);
      nextMonth.add(i, 'months');
      this.myTicks.push(nextMonth);
      const halfMonth = moment(nextMonth);
      halfMonth.date(16);
      this.myTicks.push(halfMonth);
      i++;
      // i++ example ticks sur deux lignes
      /*i++;
      i++;*/
    }
    // cause of the half Month ticks push
    // one is after the end of domain
    this.myTicks.pop();

    // --------old algo---------
    /*case 'Y': {
        startDomain.setDate(1);
        let hold;
        let tesk = false;
        // First ticks is push only if it's superior or equal to the begin of our domain
        if (domain[0] <= startDomain.getTime()) {
          this.myTicks.push(startDomain);
        }
        hold = _.cloneDeep(startDomain);
        hold.setDate(15);
        this.myTicks.push(hold);
        let nextMonth = _.cloneDeep(startDomain);
        let i = 1;
        // Set the date for get the Next Month
        nextMonth.setMonth(startDomain.getMonth() + i);
        // until the end of our domain, push one tick for the 1st day of each month
        while (nextMonth.getTime() <= domain[1]) {
          this.myTicks.push(nextMonth);
          nextMonth = _.cloneDeep(startDomain);
          nextMonth.setMonth(startDomain.getMonth() + i);
          if (tesk) {
            i++;
            nextMonth.setDate(startDomain.getDate() + 14);
            tesk = false;
          } else {
            tesk = true;
          }
        }*/
  }

  setTicksValue(domain) { // rajouter width et faire différent traitement (responsive)
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

  getTimeScale(domain, width): any {
    this.myTicks = [];
    this.setTicksAndClusterize(domain);
    return scaleTime()
        .range([0, width])
        .domain(domain);
    /*return (new Promise ((resolve) => {
      this.setTicksValue(domain);
      console.log('2');
      const test = scaleTime()
        .range([0, width])
        .domain(domain);
      resolve(test);
    }));*/
  }

  getYDomain(): any[] {
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


  getYScale(domain, height): any {
    const scaleY = scaleLinear()
        .range([height, 0])
        .domain(domain);
    return scaleY;
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  setTicksAndClusterize(domain) {
    this.setTicksValue(domain);
    this.clusterize2(domain);
  }


  /* Make special case for begin
     actually we dont take care of the first half interval of ticks
     */
  clusterize2(domain) {
    /*this.myTicks.forEach(d =>
      console.log('Ticks', d.valueOf()));*/
    console.log('CLUSTERIZE 2 : Domain', domain);
    this.dataClustered = [];
    let y = 0;
    for (const array of this._myData) { // array = [red, red, red]
      let j = 0; // array[j] = red
      this.dataClustered.push([]);
      if (array.length > 0) {
        // move array to begin of ticks time
        while (array[j] && (array[j].date < this.myTicks[0]) && (j < array.length)) {
          j++;
        }
      }
      if (j < array.length) {
        // for all ticks check if array[j] is in the interval
        for (let i = 1; i < this.myTicks.length; i++) {
          if (array[j]) {
            let feedIt = false;
            let circleDate;
            // set the new position for the circle group
            // Two Case : on ticks or in middle of two ticks
            if (this.centeredOnTicks) {
              circleDate = this.myTicks[i].valueOf();
            } else {
              circleDate = this.myTicks[i - 1].valueOf() + ((this.myTicks[i].valueOf() - this.myTicks[i - 1].valueOf()) / 2);
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
              r: 12, // array[j].r
              // W2 7 D10 12 W1 16
              // M2 12 D45 16 M1 20
              // Y2 12 D180 16 Y1 24
            };
            let startLimit: number;
            let endLimit: number;
            // Group Algo 1
            if (this.centeredOnTicks) {
              /* Make special case for begin
                 actually we dont take care of the first half interval of ticks*/
              startLimit = this.myTicks[i] - ((this.myTicks[i] - this.myTicks[i - 1]) / 2);
              // Last tick has is own value for endLimit;
              if (i + 1 === this.myTicks.length) {
                endLimit = this.myTicks[i].valueOf();
              } else {
                endLimit = this.myTicks[i] + ((this.myTicks[i + 1] - this.myTicks[i]) / 2);
              }
            } else { // Group Algo 2
              startLimit = this.myTicks[i - 1];
              // !!! actually the domain[1], last value of ticks, it's exclude !!!
              endLimit = this.myTicks[i];

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

  /*  clusterize(chartData) {
      let data = chartData;
      data.forEach((d) => {
        d.date = new Date(d.date).getTime();
        d.count = +d.count;
      });
      data.sort((val1, val2) => { return val1.date - val2.date });


      // maxObjHeight decide the metrics for two object become one
      const maxObjHeight = 100 * 0.25; // this.dims.height * 0.25;

      // Recupérer uniquement les val de la range
      let mostRecent = data[data.length - 1].date;

      const dateSpan = this.timeScale.invert(maxObjHeight).getTime() - this.timeScale.invert(0).getTime();
      let startDate = data[0].date;
      let endDate = startDate + dateSpan * 0.5; // initially we use radius
      let ret = [];
      let o = { date: 0, count: 0, value: 0,
        cy: 0,
        r: 0,
        color: '',
        stroke: '' };
      let i = 0;
      this.dateSpanObj = 0;
      this.colorChecked = '';
      function findWithinDateRange( item ) {
        let d = item.date;
        /!*if (this.dateSpanObj !== 0) {
          const newEndDate = startDate + this.dateSpanObj;
          if (d >= startDate && d < newEndDate) { // rajouter un check sur la couleur des bulles
            console.log('new IF');
            o.date += d;
            o.count += item.count;
            o.value = item.value;
            o.cy = item.cy;
            o.r = item.r;
            o.color = item.color;
            o.stroke = item.stroke;
            i++;
          }
        }
        else *!/if (d >= startDate && d < endDate) { // rajouter un check sur la couleur des bulles
          if (i === 0) {
            this.colorChecked = item.color;
            this.dateSpanObj = this.timeScale.invert(item.r * 2).getTime() - this.timeScale.invert(0).getTime();
            endDate = startDate + this.dateSpanObj;
            o.r = item.r;
          } else {
            if (this.colorChecked !== item.color) {
              return;
            }
          }
          o.date += d;
          o.count += item.count;
          o.value = item.value;
          o.cy = item.cy;
          o.color = item.color;
          o.stroke = item.stroke;
          i++;
        }
      }
      while (endDate <= mostRecent + dateSpan) {
        data.forEach(findWithinDateRange.bind(this));
        if (i === 1) {
          ret.push({
            date: o.date,
            count: o.count,
            value: o.value,
            cy: o.cy,
            r: o.r,
            color: o.color,
            stroke: o.stroke,
          });
        }
        else if (i > 1) {
          ret.push({
            date: o.date / i,
            count: o.count,
            value: o.value,
            cy: o.cy,
            r: o.r,
            color: o.color,
            stroke: o.stroke,
          });
        }
        o = { date: 0, count: 0, value: 0,
          cy: 0,
          r: o.r,
          color: '',
          stroke: '' };
        i = 0;
        startDate = endDate;
        endDate += dateSpan; // add circle diameter
        this.dateSpanObj = 0;
        this.colorChecked = '';
      }

      mostRecent = ret[ret.length - 1].date;

      return ret;
    }*/
}
