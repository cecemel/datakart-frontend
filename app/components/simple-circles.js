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
import { interpolateRainbow } from 'd3-color'

const { run, get } = Ember;

export default Component.extend({
  layout,

  tagName: 'svg',
  classNames: ['awesome-d3-widget'],

  width: 1300,
  height: 800,

  attributeBindings: ['width', 'height'],

  didReceiveAttrs() {
    run.scheduleOnce('render', this, this.drawScene);
  },

  getDistance(a, b){
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    return Math.sqrt( dx*dx + dy*dy );
  },

  getDeterminant(twoByTwo){
    return (twoByTwo[0][0] * twoByTwo[1][1]) - (twoByTwo[1][0] *twoByTwo[0][1]);
  },

  getArea(matrix){
    //note: expects points to be ordered counter clockwise
    let determinants = [];
    for(var i=0; i < matrix.length; ++i){
      if(i === matrix.length - 1){
        determinants.push(this.getDeterminant([matrix[i], matrix[0]]));
        break;
      }
      determinants.push(this.getDeterminant([matrix[i], matrix[i+1]]));
    }
    console.log('length determinants %@'.fmt(determinants.length))
    return determinants.reduce((sum, value) => {
      return sum + value;
    },0)/2;
  },

  getLineInstance(lineData, xScale, yScale){
    return line()
    .x(function (d,i){ return xScale(lineData[i][0]);})
    .y(function (d,i){ return yScale(lineData[i][1]);})
    (Array(lineData.length));
  },

  writeAnchorsStats(plot, yHeight, anchor1Index, anchor2Index, anchor1, anchor2){
    plot.append("text")
    .attr("x", () => 1000)
    .attr("y", () => yHeight)
    .text( () => { return "anchors dist. [%@,%@]: %@ m".fmt(anchor1Index, anchor2Index,
      (this.getDistance(anchor1, anchor2)/1000).toFixed(2));})
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "blue");
  },

  drawLineAnchors(plot, anchor1, anchor2, xScale, yScale){
    plot.append("path")
    .attr("d", this.getLineInstance([anchor1, anchor2], xScale, yScale))
    .attr("class", "line")
    .style ("stroke-width", 2)
    .style("stroke", "green" )
    .attr('fill', 'none');


    plot.append("text")
    .attr("x", () => xScale(anchor1[0] - 5))
    .attr("y", () => yScale(anchor1[1] - 5))
    .text( () => { return ""; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "red");
  },

  drawScene(){
    let plot = select(this.element);
    let data = get(this, 'data.rawData');
    let width = get(this, 'width');
    let height = get(this, 'height');
    let timeStart = Date.parse(data[0][2]);
    let timeEnd = Date.parse(data[data.length -1][2]);
    let timeDelta = (timeEnd - timeStart)/1000; //in ms -> s
    console.log(timeDelta)



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

    //speed
    let distance = data.reduce((distance, value, index) =>{
      if(index >= data.length - 1){
        return distance;
      }
      distance = distance + this.getDistance(data[index], data[index + 1]);
      return distance;

    },0)/1000; // in mm -> m


    plot.append("text")
    .attr("x", () => 1000)
    .attr("y", () => 200)
    .text( () => { return "distance: " + (distance).toFixed(2) + " m"; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "blue");

    plot.append("text")
    .attr("x", () => 1000)
    .attr("y", () => 250)
    .text( () => { return "avg. speed: " + ((distance/timeDelta)*3600/1000).toFixed(2) + "km/h"; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "blue");



    //add origin
    let domainArray = data.slice();
    domainArray.push([0,0]);


    // X scale to scale position on x axis
    let xScale = scaleLinear()
      .domain([-40000, 40000])
      //.domain([-50000, 20000])
      //.domain(extent(domainArray.map((d) => d[0])))
      .range([0, width]);

    // Y scale to scale radius of circles proportional to size of plot
    let yScale = scaleLinear()
      .domain([-40000, 40000])
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

      let anchors = []
      let anchor_index = 0

      //anchors
      this.get("data.anchorsConfiguration.deployedAnchors").forEach(a =>{
        anchors.push([parseInt(a.get("pointCoordinate.xValue")), parseInt(a.get("pointCoordinate.yValue"))])

        plot.append('circle')
          .attr('fill', 'steelblue')
          .attr('opacity', 0.5)
          .attr('r', () => 20)
          .attr('cy', () => yScale(parseInt(-1 * a.get("pointCoordinate.yValue"))))
          .attr('cx', () => xScale(parseInt(a.get("pointCoordinate.xValue"))));

        // plot.append("text")
        // .attr("x", () => xScale(a.get("pointCoordinate.xValue") - 5))
        // .attr("y", () => yScale(-1* (a.get("pointCoordinate.yValue") - 5)))
        // .text( () => { return "( " + a.get("pointCoordinate.xValue") +
        //                               ", " + a.get("pointCoordinate.yValue") +" )"; })
        // .attr("font-family", "sans-serif")
        // .attr("font-size", "20px")
        // .attr("fill", "red");

        plot.append("text")
        .attr("x", () => xScale(a.get("pointCoordinate.xValue") - 5))
        .attr("y", () => yScale(-1* (a.get("pointCoordinate.yValue") - 5)))
        .text( () => { return "anchor " + anchor_index; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "red");
        ++anchor_index;
      });

      //https://stackoverflow.com/questions/18353312/d3-linear-gradient-to-geojson-path-according-its-value#

      // color
      let colorScale = scaleLinear().domain([0, 50]).range(["red", "green"]);

    //line drawing
    plot.append("path")
    .attr("d", this.getLineInstance(data, xScale, yScale))
    .attr("class", "line")
    // .style ("stroke", function(d) { return colorScale(d.properties.speed); })
    .style ("stroke-width", 2)
    .style("stroke", "black" )
    .attr('fill', 'none');



    //distance between anchors
    // this.drawLineAnchors(plot, anchors[0], anchors[1], xScale, yScale);
    this.writeAnchorsStats(plot, 300, 0, 1, anchors[0], anchors[1]);
    this.writeAnchorsStats(plot, 350, 1, 2, anchors[1], anchors[2]);
    this.writeAnchorsStats(plot, 400, 2, 3, anchors[2], anchors[3]);
    this.writeAnchorsStats(plot, 450, 1, 3, anchors[1], anchors[3]);
    this.writeAnchorsStats(plot, 500, 0, 2, anchors[0], anchors[2]);
    this.writeAnchorsStats(plot, 550, 0, 3, anchors[0], anchors[3]);
    // this.drawLineAnchors(plot, anchors[1], anchors[2], xScale, yScale);
    // this.drawLineAnchors(plot, anchors[2], anchors[3], xScale, yScale);
    // this.drawLineAnchors(plot, anchors[0], anchors[3], xScale, yScale);
    // this.drawLineAnchors(plot, anchors[1], anchors[3], xScale, yScale);
    // this.drawLineAnchors(plot, anchors[0], anchors[2], xScale, yScale);

    //area
    let area = (this.getArea(anchors.slice().reverse())/1000000).toFixed(2);
    plot.append("text")
    .attr("x", () => 1000)
    .attr("y", () => 600)
    // in mm -> m
    .text( () => { return "surface anchors %@ mˆ2".fmt(area); })
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "blue");



    //data
    // <h2>overview</h2>
    // time start: {{timeStart}}
    // time stop: {{timeStop}}
    // distance: {{distance}}
    // speed: {{speed}}
    // {{yield}}

  },
});
