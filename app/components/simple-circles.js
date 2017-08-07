/*
 * This dummy component demonstrates how to use ember-d3 to build a simple
 * data visualization. It's an extension of the https://bost.ocks.org/mike/circles/
 * example with some more fancy elements.
 *
 * In this example we receive data from our dummy data source in the index route,
 * which sends us new data every second.
 *
 * When new data arrives we calculate 2 scales, one for x and y, representing
 * placement on the x plane, and relative size for the radius of the circles.
 *
 * The scale functions use some handy helpers from the d3-array package to figure
 * out the size of our dataset.
 *
 * We also initialize a transition object which will be used towards the end to
 * transition the data `merge` from new data to existing data.
 */

import Ember from 'ember';
import Component from 'ember-component';
import layout from '../templates/components/simple-circles';

// Import the D3 packages we want to use
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { extent, ascending } from 'd3-array';
import { line } from 'd3-shape';
import { transition } from 'd3-transition';
import { easeCubicInOut } from 'd3-ease';

const { run, get } = Ember;

export default Component.extend({
  layout,

  tagName: 'svg',
  classNames: ['awesome-d3-widget'],

  width: 1200,
  height: 800,

  attributeBindings: ['width', 'height'],

  didReceiveAttrs() {
    run.scheduleOnce('render', this, this.drawScene);
  },

  drawScene(){
    let plot = select(this.element);
    let data = get(this, 'data.rawData');
    let width = get(this, 'width');
    let height = get(this, 'height');


    //filter excessive speed
    // data = data.reduce((acc, val, i) => {
    //   if(i === 0){
    //     acc.push(val);
    //     return acc;
    //   }
    //   let prev = acc[acc.length - 1];
    //   let deltaX = prev[0] - val[0];
    //   let deltaY = prev[1] - val[1];
    //   let dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    //   if(dist > 5000){
    //     return acc;
    //   }
    //   acc.push(val);
    //   return acc;
    // }, []);

    data = data.map( e =>{
      return [e[0], -1 * e[1]];
    });

    //filter withing bounding box
    // data = data.filter( e => {
    //   if( e[0] <= 13291 && e[0] >= 0 && e[1] <= 13902 && e[1] >=0) {
    //     return e;
    //     }
    // });

    console.log(data.length);
    // console.log(data[3][0])
    console.log(data);

    // moving average
    let movAvg = [];
    for(var i = 0; i < data.length - 5; ++i){
      let _window = data.slice(i, i+5);

      let xAvg = _window.reduce((acc, val) => {
        return acc + val[0];
      }, _window[0][0])/5;

      let yAvg = _window.reduce((acc, val) => {
        return acc + val[1];
      }, _window[0][1])/5;

      movAvg.push([xAvg, yAvg]);

    }
    data = movAvg;


    //add origin
    let domainArray = data.slice();
    domainArray.push([0,0]);


    // X scale to scale position on x axis
    let xScale = scaleLinear()
      .domain([-50000, 50000])
      //.domain([-50000, 20000])
      //.domain(extent(domainArray.map((d) => d[0])))
      .range([0, width]);

    // Y scale to scale radius of circles proportional to size of plot
    let yScale = scaleLinear()
      .domain([-50000, 50000])
      //.domain(extent(domainArray.map((d) => d[1]).sort(ascending)))
      .range([0, height]);



      //draw every x sec a timestamp
      for(var l=0; l < data.length; ++l){
        // if(! (l % 15 === 0)){
        //   continue;
        // }
        plot.append('circle')
          .attr('fill', 'red')
          .attr('opacity', 0.5)
          .attr('r', () => 5)
          .attr('cy', () => yScale(data[l][1]))
          .attr('cx', () => xScale(data[l][0]));

        // plot.append("text")
        // .attr("x", () => xScale(a.get("pointCoordinate.xValue") - 5))
        // .attr("y", () => yScale(-1* (a.get("pointCoordinate.yValue") - 5)))
        // .text( () => { return "( " + a.get("pointCoordinate.xValue") +
        //                               ", " + a.get("pointCoordinate.yValue") +" )"; })
        // .attr("font-family", "sans-serif")
        // .attr("font-size", "20px")
        // .attr("fill", "red");


      }



      //anchors
      this.get("data.anchorsConfiguration.deployedAnchors").forEach(a =>{
        plot.append('circle')
          .attr('fill', 'steelblue')
          .attr('opacity', 0.5)
          .attr('r', () => 20)
          .attr('cy', () => yScale(-1 * a.get("pointCoordinate.yValue")))
          .attr('cx', () => xScale(a.get("pointCoordinate.xValue")));

        plot.append("text")
        .attr("x", () => xScale(a.get("pointCoordinate.xValue") - 5))
        .attr("y", () => yScale(-1* (a.get("pointCoordinate.yValue") - 5)))
        .text( () => { return "( " + a.get("pointCoordinate.xValue") +
                                      ", " + a.get("pointCoordinate.yValue") +" )"; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "red");
      });


    //line drawing
    let lineInstance = (lineData) => {
        return line()
        .x(function (d,i){ return xScale(lineData[i][0]);})
        .y(function (d,i){ return yScale(lineData[i][1]);})
        (Array(lineData.length));
      };

    plot.append("path")
    .attr("d", lineInstance(data))
    .attr("class", "line")
    .style("stroke", "black" )
    .attr('fill', 'none');

  },
});
