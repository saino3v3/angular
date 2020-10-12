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
    let format = d3.timeFormat('%I:%M:%S');

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
    let xScale = d3.scaleTime()
      .domain([
        d3.min(this.dataset_time, (d)=>{return d.date;}),
        d3.max(this.dataset_time, (d)=>{return d.date;})
      ]).range([padding, this.svgWidth-padding]);
    let yScale = d3.scaleLinear()
      .domain([
        0,
        d3.max(this.dataset_time, (d)=>{return d.value;})
      ]).range([this.svgHeight-padding, padding]);
    
    let axisx = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(format);
    let axisy = d3.axisLeft(yScale);

    x.attr('transform', 'translate(' + 0 + ',' + (this.svgHeight-padding) + ')')
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
      .attr('d', line1);
    
    // tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip');
    const bisectDate = d3.bisector((d:IData)=>{return d.date;}).left;
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
  }

  private clickButton() {
    let dataset1 = [
      { date: '2020/10/1 7:12:00', value: Math.random()*100 },
      { date: '2020/10/1 7:12:10', value: Math.random()*100 },
      { date: '2020/10/1 7:12:20', value: Math.random()*100 },
      { date: '2020/10/1 7:12:30', value: Math.random()*100 },
    ];

    this.dataset_time = dataset1.map((d) => {return {date: this.timeparser(d.date), value: d.value }});
  }
}
