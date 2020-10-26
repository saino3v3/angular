import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { drag } from 'd3';

interface IData {
  date: Date;
  value: number;
}
interface IBar {
  start: Date;
  end: Date;
  name: string;
}

@Component({
  selector: 'app-d3-view',
  templateUrl: './d3-view.component.html',
  styleUrls: ['./d3-view.component.css']
})
export class D3ViewComponent implements OnInit {
  readonly svgWidth = 600;
  readonly svgHeight = 300;
  private svgElement: any;
  // private svg: d3.Selection<any, {}, null, undefined>;
  private svgDiagram: d3.Selection<SVGElement, {}, HTMLElement, undefined>;
  private svgBar: d3.Selection<SVGElement, {}, HTMLElement, undefined>;
  private dataset_time: IData[][] = [];
  private dataset_bar: IBar[] = [];
  private timeparser: Function;
  private xScale: d3.ScaleTime<number, number>;
  private yScaleDiagram: d3.ScaleLinear<number, number>;
  private yScaleBar: d3.ScaleBand<string>;
  private format;
  private bisectDate: Function;
  private isError: boolean = false;
  private tooltip: d3.Selection<HTMLDivElement, {}, HTMLElement, undefined>;
  private focus: d3.Selection<SVGGElement, {}, HTMLElement, undefined>;

  private STATION_MAP = [
    'JY01',
    'JY02',
    'JY03',
    'JY04',
    'JY05',
    'JY06',
    'JY07',
    'JY08',
    'JY09',
    'JY10',
  ]
  
  constructor() { }

  ngOnInit() {
    this.svgDiagram = d3.select('#svg-chart');
    this.svgBar = d3.select('#svg-bar');
    this.initDiagram();
    this.initBar();
  }

  private initDiagram() {

    // 軸の描画
    this.timeparser = d3.timeParse('%Y/%m/%d %I:%M:%S');
    let format = this.format = (d: Date) => {
      if (d.getMinutes() === 0) {
        return d.getHours().toString();
      } else {
        return d.getMinutes().toString();
      }
    } 

    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: 1 },
      { date: '2020/10/1 7:13:00', value: 4 },
      { date: '2020/10/1 7:17:00', value: 9 },
      { date: '2020/10/1 7:21:00', value: 5 },
    ];

    this.dataset_time[0] = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});

    let x = this.svgDiagram.append('g')
      .attr('class', 'axis axis-x');
    let y = this.svgDiagram.append('g')
      .attr('class', 'axis axis-y');

    const padding = 50;
    this.xScale = d3.scaleTime()
      .domain([new Date('2020/10/1 6:00:00'), new Date('2020/10/1 9:00:00')])
      .range([padding, this.svgWidth-padding]);
    this.yScaleDiagram = d3.scaleLinear()
      .domain([
        d3.max(this.dataset_time[0], (d)=>{return d.value;}),
        0
      ]).range([this.svgHeight-padding, padding]);
    
    let axisx = d3.axisTop(this.xScale)
      .ticks(d3.timeMinute.every(10))
      .tickFormat(format);
    let axisy = d3.axisLeft(this.yScaleDiagram)
      .tickFormat((d: number) => {
        return this.STATION_MAP[d];
      });

    x.attr('transform', 'translate(' + 0 + ',' + (padding) + ')')
      .call(axisx);
    y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
      .call(axisy);
    // 軸の描画ここまで

    // データの描画
    const green = '#00CB00';
    let path = this.svgDiagram.append('path');
    let line1 = d3.line<IData>()
      .x((d)=>{return this.xScale(d.date);})
      .y((d)=>{return this.yScaleDiagram(d.value);});
    
    path.datum(this.dataset_time[0])
      .attr('fill', 'none')
      .attr('stroke', green)
      .attr('d', line1)
      .attr('class', 'line1');
    
    // tooltip
    this.tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip');
    this.bisectDate = d3.bisector((d:IData)=>{return d.date;}).left;
    this.focus = this.svgDiagram.append('g')
      .attr('class', 'focus')
      .style('visibility', 'hidden');
    
    const focusLine = this.focus.append('line');

    const focusPoint = this.focus.append('circle')
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', green)
      .attr('stroke-width', 2);
    
    const overlay = this.svgDiagram.append('rect');
    overlay.style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('class', 'overlay')
      .attr('width', this.svgWidth - padding)
      .attr('height', this.svgHeight - padding)
      .attr('x', padding)
      .attr('y', padding);

    focusLine.style('stroke', '#ccc')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '2')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', padding)
      .attr('y2', this.svgHeight-padding);

    overlay.on('mousemove', this.hoverMousetoDiagram.bind(this))
        .on('mouseout', this.hoverOutMousetoDiagram.bind(this));
  }

  private initBar() {
    // 軸の描画
    let dataset = [
      { start: '2020/10/1 7:00:00', end: '2020/10/1 7:00:00' , name: 'J0101' },
      { start: '2020/10/1 6:12:00', end: '2020/10/1 7:48:00', name: 'J0201' },
    ];

    this.dataset_bar = dataset.map((d) => {
      return {
        start: this.timeparser(d.start),
        end: this.timeparser(d.end),
        name: d.name
      }});
    this.dataset_bar[0].start = d3.min(this.dataset_time[0], (d) => {return d.date});
    this.dataset_bar[0].end = d3.max(this.dataset_time[0], (d) => {return d.date});

    const padding = 50;
    this.yScaleBar = d3.scaleBand()
      .range([this.svgHeight-padding, padding])
      .domain(this.dataset_bar.map((d) => {return d.name}));

    let x = this.svgBar.append('g')
      .attr('class', 'axis axis-x');
    let y = this.svgBar.append('g')
      .attr('class', 'axis axis-y');

   
    let axisx = d3.axisTop(this.xScale)
      .ticks(d3.timeMinute.every(10))
      .tickFormat(this.format);
    let axisy = d3.axisLeft(this.yScaleBar);

    x.attr('transform', 'translate(' + 0 + ',' + (padding) + ')')
      .call(axisx);
    y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
      .call(axisy);
    // 軸の描画ここまで

    // データの描画
    const green = '#00CB00';
    this.svgBar.selectAll('.bar')
      .data(this.dataset_bar)
      .enter().append('rect')
      .attr('class', (d) => {return d.name})
      .classed('bar', true)
      .attr('width', (d) => {
        return this.xScale(d.end) - this.xScale(d.start)
      }).attr('y', (d) => {
        return this.yScaleBar(d.name)+padding;
      }).attr('x', (d) => {
        return this.xScale(d.start);
      }).attr('height', 2)

    let range = 5;
    const overlay = this.svgBar.selectAll('.overlay')
      .data(this.dataset_bar).enter()
      .append('rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('class', (d) => {return d.name})
      .classed('overlay', true)
      .attr('width', (d) => {
        return this.xScale(d.end) - this.xScale(d.start) + range * 2;
      }).attr('y', (d) => {
        return this.yScaleBar(d.name) + padding - range;
      }).attr('x', (d) => {
        return this.xScale(d.start) - range;
      }).attr('height', 2 + range * 2)
      .on('mousemove', this.hoverMousetoBar.bind(this))
      .on('mouseout', this.hoverOutMousetoBar.bind(this))
      .call(d3.drag().on('drag', this.dragged.bind(this)));
    
  }

  private hoverMousetoDiagram(event: d3.ClientPointEvent) {
    let x0 = this.xScale.invert(event.clientX);
    let y0 = this.yScaleDiagram.invert(event.clientY);
    
    let d: IData = null;
    this.dataset_time.forEach(element => {
      element.forEach(value => {
        if(d) {
          let lastD = Math.abs(y0 - d.value) + Math.abs(x0.valueOf() - d.date.valueOf());
          let newD = Math.abs(y0 - value.value) + Math.abs(x0.valueOf() - value.date.valueOf());
          d =  lastD > newD ? value : d;
        } else {
          d = value;
        }
      })
     });

    let tooltipY = (event.clientY - 40);
    let tooltipX = (event.clientX + 20);

    if((window.innerWidth - 160) < tooltipX) {
      tooltipX = (event.clientX - 200);
    }

    this.tooltip.html('')
      .style('visibility', 'visible')
      .style('top', tooltipY + 'px')
      .style('left', tooltipX + 'px');
    this.tooltip.append('div')
      .attr('class', 'tooltip-time')
      .html(d.date.toString() + '<br>' + this.STATION_MAP[d.value]);
    
    this.focus.style('visibility', 'visible')
      .attr('transform', 'translate(' + this.xScale(d.date) + ',' + 0 + ')');
    this.focus.select('circle').attr('transform', 'translate(' + 0 + ',' + this.yScaleDiagram(d.value) + ')');
  }

  private dragged(d: d3.D3DragEvent<SVGRectElement, IBar[], IBar>, target) {
    const newDate = this.xScale.invert(d.x);
    d.subject.start = this.xScale.invert(this.xScale(d.subject.start) + d.dx);
    this.svgBar.selectAll('.' + d.subject.name)
      .raise();
  }

  private hoverOutMousetoDiagram (event) {
    this.tooltip.style('visibility', 'hidden');
    this.focus.style('visibility', 'hidden');
  }

  private hoverMousetoBar(event: d3.ClientPointEvent, target: IBar) {
    let x0 = this.xScale.invert(event.clientX);
    let y0 = this.yScaleDiagram.invert(event.clientY);
    
    let tooltipY = (event.clientY - 40);
    let tooltipX = (event.clientX + 20);

    if((window.innerWidth - 160) < tooltipX) {
      tooltipX = (event.clientX - 200);
    }

    this.tooltip.html('')
      .style('visibility', 'visible')
      .style('top', tooltipY + 'px')
      .style('left', tooltipX + 'px');
    this.tooltip.append('div')
      .attr('class', 'tooltip-time')
      .html(target.name + '<br>start: ' + target.start.toString());
    this.svgBar.select('rect.' + target.name)
      .classed('focus', true); 
  }

  private hoverOutMousetoBar (event, target) {
    this.tooltip.style('visibility', 'hidden');
    this.focus.style('visibility', 'hidden');
    this.svgBar.select('rect.' + target.name)
      .classed('focus', false); 
  }

  private clickButton1() {
    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: Math.random()*2 },
      { date: '2020/10/1 7:28:00', value: Math.random()*2 + 2 },
      { date: '2020/10/1 7:40:00', value: Math.random()*2 + 4 },
      { date: '2020/10/1 7:59:00', value: Math.random()*2 + 6 },
    ];
    const length = this.dataset_time.length;
    this.dataset_time[length] = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});
    this.dataset_time[length].sort((a, b) => {
      if(a.date < b.date) return -1;
      if(a.date > b.date) return 1;
      return 0;
    });
    const color = '#0000CB';
    let path = this.svgDiagram.append('path');
    let line1 = d3.line<IData>()
      .x((d)=>{return this.xScale(d.date)})
      .y((d)=>{return this.yScaleDiagram(d.value);});
    
    path.datum(this.dataset_time[length])
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('d', line1);
  }

  private clickButton2() {
    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: Math.random()*10 },
      { date: '2020/10/1 7:12:00', value: Math.random()*10 },
      { date: '2020/10/1 7:12:00', value: Math.random()*10 },
      { date: '2020/10/1 7:12:00', value: Math.random()*10 },
    ];
    let x = this.svgDiagram.select('.axis-x');
    // let y = this.svg.select('.axis-y');
    const padding = 50;
    const xScale = this.xScale = d3.scaleTime()
      .domain([
        d3.min(this.dataset_time[0], (d)=>{return d.date;}),
        d3.max(this.dataset_time[0], (d)=>{return d.date;})
      ]).range([padding, this.svgWidth-padding]);
    // const yScale = this.yScale = d3.scaleLinear()
    //   .domain([
    //     0,
    //     d3.max(this.dataset_time, (d)=>{return d.value;})
    //   ]).range([this.svgHeight-padding, padding]);
    
    let axisx = d3.axisTop(xScale)
      .ticks(10)
      .tickFormat(this.format);
    // let axisy = d3.axisLeft(yScale);

    // x.attr('transform', 'translate(' + 0 + ',' + (this.svgHeight-padding) + ')')
    x.attr('transform', 'translate(' + 0 + ',' + (padding) + ')')
      .call(axisx);
    // y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
    //   .call(axisy);
    // 軸の描画ここまで
  }
  private clickButton3() {
    let dataset1 = [
      { date: '2020/10/1 6:53:00', value: Math.random()*2 },
      { date: '2020/10/1 7:09:00', value: Math.random()*2 + 2 },
      { date: '2020/10/1 7:27:00', value: Math.random()*2 + 4 },
      { date: '2020/10/1 7:48:00', value: Math.random()*2 + 6 },
    ];

    this.dataset_time[0] = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});
    this.dataset_time[0].sort((a, b) => {
      if(a.date < b.date) return -1;
      if(a.date > b.date) return 1;
      return 0;
    });
    const color = '#00CB00';
    let path = this.svgDiagram.select('.line1');
    let line1 = d3.line<IData>()
      .x((d)=>{return this.xScale(d.date);})
      .y((d)=>{return this.yScaleDiagram(d.value);});
    
    path.remove().enter();
    this.svgDiagram.append('path').datum(this.dataset_time[0])
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('d', line1)
      .attr('class', 'line1');
  }
  private clickButton4() {
    if (this.isError) {
      let path = this.svgDiagram.select('.line_error');
      path.remove().enter();
      this.isError = false;
    } else {
      let dataset_error= this.dataset_time[0].slice(1,3);
      const color = '#CB0000';
      let path = this.svgDiagram.append('path');
      let line1 = d3.line<IData>()
        .x((d)=>{return this.xScale(d.date);})
        .y((d)=>{return this.yScaleDiagram(d.value);});
      
      this.svgDiagram.append('path').datum(dataset_error)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('d', line1)
        .attr('class', 'line_error')
        .style('stroke-width', '2px');
      this.isError = true;
    }
    
  }
}
