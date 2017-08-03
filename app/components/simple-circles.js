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

    //add origin
    let domainArray = data.slice();
    domainArray.push([0,0]);


    // X scale to scale position on x axis
    let xScale = scaleLinear()
      .domain(extent(domainArray.map((d) => d[0])))
      .range([0, width]);

    // Y scale to scale radius of circles proportional to size of plot
    let yScale = scaleLinear()
      .domain(extent(domainArray.map((d) => d[1]).sort(ascending)))
      .range([0, height]);


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

    //anchors
    this.get("data.anchorsConfiguration.deployedAnchors").forEach(a =>{
      plot.append('circle')
        .attr('fill', 'steelblue')
        .attr('opacity', 0.5)
        .attr('r', () => 20)
        .attr('cy', () => yScale(a.get("pointCoordinate.yValue")))
        .attr('cx', () => xScale(a.get("pointCoordinate.xValue")));

      plot.append("text")
      .attr("x", () => xScale(a.get("pointCoordinate.xValue") - 5))
      .attr("y", () => yScale(a.get("pointCoordinate.yValue") - 5))
      .text( () => { return "( " + a.get("pointCoordinate.xValue") +
                                    ", " + a.get("pointCoordinate.yValue") +" )"; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "20px")
      .attr("fill", "red");
    });

  },
});
