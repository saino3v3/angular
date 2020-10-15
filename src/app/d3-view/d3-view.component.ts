import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
interface IData {
  date: Date;
  value: number;
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
  private svg: d3.Selection<SVGElement, {}, HTMLElement, undefined>;
  private dataset_time: IData[];
  private timeparser: Function;
  private xScale: d3.ScaleTime<number, number>;
  private yScale: d3.ScaleLinear<number, number>;
  private format;
  private bisectDate: Function;
  private isError: boolean = false;

  constructor() { }

  ngOnInit() {
/*    this.svgElement = d3.select('svg');
    this.svg = d3.select(this.svgElement); */
    this.svg = d3.select('svg');

    // g.charts-containerを最初一回追加
/*    this.svg
        .append('g')
        .attr('class', 'charts-container');
*/   
    // 軸の描画
    this.timeparser = d3.timeParse('%Y/%m/%d %I:%M:%S');
    let format = this.format = d3.timeFormat('%I:%M:%S');

    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: 10 },
      { date: '2020/10/1 7:12:10', value: 14 },
      { date: '2020/10/1 7:12:20', value: 19 },
      { date: '2020/10/1 7:12:30', value: 25 },
    ];

    this.dataset_time = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});

    let x = this.svg.append('g')
      .attr('class', 'axis axis-x');
    let y = this.svg.append('g')
      .attr('class', 'axis axis-y');

    const padding = 50;
    const xScale = this.xScale = d3.scaleTime()
      .domain([
        d3.min(this.dataset_time, (d)=>{return d.date;}),
        d3.max(this.dataset_time, (d)=>{return d.date;})
      ]).range([padding, this.svgWidth-padding]);
    const yScale = this.yScale = d3.scaleLinear()
      .domain([
        0,
        d3.max(this.dataset_time, (d)=>{return d.value;})
      ]).range([this.svgHeight-padding, padding]);
    
    let axisx = d3.axisTop(xScale)
      .ticks(10)
      .tickFormat(format);
    let axisy = d3.axisLeft(yScale);

    // x.attr('transform', 'translate(' + 0 + ',' + (this.svgHeight-padding) + ')')
    x.attr('transform', 'translate(' + 0 + ',' + (padding) + ')')
      .call(axisx);
    y.attr('transform', 'translate(' + padding + ',' + 0 + ')')
      .call(axisy);
    // 軸の描画ここまで

    // データの描画
    const green = '#00CB00';
    let path = this.svg.append('path');
    let line1 = d3.line<IData>()
      .x((d)=>{return xScale(d.date);})
      .y((d)=>{return yScale(d.value);});
    
    path.datum(this.dataset_time)
      .attr('fill', 'none')
      .attr('stroke', green)
      .attr('d', line1)
      .attr('class', 'line1');
    
    // tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip');
    this.bisectDate = d3.bisector((d:IData)=>{return d.date;}).left;
    const focus = this.svg.append('g')
      .attr('class', 'focus')
      .style('visibility', 'hidden');
    
    const focusLine = focus.append('line');

    const focusPoint = focus.append('circle')
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', green)
      .attr('stroke-width', 2);
    
    const overlay = this.svg.append('rect');
    overlay.style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('class', 'overlay')
      .attr('width', this.svgWidth - padding)
      .attr('height', this.svgHeight - padding);

    focusLine.style('stroke', '#ccc')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '2')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', padding)
      .attr('y2', this.svgHeight-padding);

    
  }

  private hoverMousetoSVG(node: d3.ContainerElement) {
    let x0 = this.xScale.invert(d3.mouse(node)[0]);
    let i = this.bisectDate(this.dataset_time, x0, 1);

    let d0 = this.dataset_time[i - 1];
    let d1 = this.dataset_time[i];
    let d = x0.valueOf() - d0.date.valueOf() > d1.date.valueOf() - x0.valueOf() ? d1: d0;
    
    let tooltipY = (d3.event.pageY - 40);
    let tooltipX = (d3.event.pageX + 20);
  }

  private clickButton1() {
    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: Math.random()*24 },
      { date: '2020/10/1 7:12:10', value: Math.random()*24 },
      { date: '2020/10/1 7:12:20', value: Math.random()*24 },
      { date: '2020/10/1 7:12:30', value: Math.random()*24 },
    ];

    this.dataset_time = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});
    const color = '#0000CB';
    let path = this.svg.append('path');
    let line1 = d3.line<IData>()
      .x((d)=>{return this.xScale(d.date);})
      .y((d)=>{return this.yScale(d.value);});
    
    path.datum(this.dataset_time)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('d', line1);
  }

  private clickButton2() {
    let dataset1 = [
      { date: '2020/10/1 7:12:20', value: Math.random()*24 },
      { date: '2020/10/1 7:12:30', value: Math.random()*24 },
      { date: '2020/10/1 7:12:40', value: Math.random()*24 },
      { date: '2020/10/1 7:12:50', value: Math.random()*24 },
    ];
    let x = this.svg.select('.axis-x');
    // let y = this.svg.select('.axis-y');
    const padding = 50;
    const xScale = this.xScale = d3.scaleTime()
      .domain([
        d3.min(this.dataset_time, (d)=>{return d.date;}),
        d3.max(this.dataset_time, (d)=>{return d.date;})
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
      { date: '2020/10/1 7:12:00', value: Math.random()*24 },
      { date: '2020/10/1 7:12:10', value: Math.random()*24 },
      { date: '2020/10/1 7:12:20', value: Math.random()*24 },
      { date: '2020/10/1 7:12:30', value: Math.random()*24 },
    ];

    this.dataset_time = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});
    const color = '#00CB00';
    let path = this.svg.select('.line1');
    let line1 = d3.line<IData>()
      .x((d)=>{return this.xScale(d.date);})
      .y((d)=>{return this.yScale(d.value);});
    
    path.remove().enter();
    this.svg.append('path').datum(this.dataset_time)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('d', line1)
      .attr('class', 'line1');
  }
  private clickButton4() {

  }
}
