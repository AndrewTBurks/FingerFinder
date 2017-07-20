"use strict";

var App = App || {};

let TimeChartView = function(div) {
  let self = {
    div: null,
    SVG: null,
    width: null,
    height: null,

    timeScale: null,
    fingerScale: null,

    runPaths: null,
    currentSelection: [10, 30],

    brush: null,
    brushG: null
  };

  init();

  function init() {
    self.div = d3.select(div);

    setupSVG();
  }

  function setupSVG() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    self.width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    self.height = elemNode.clientHeight - titleHeight - titleMargin;

    self.SVG = self.div
      .append("svg")
      .attr("width", self.width)
      .attr("height", self.height)
      .attr("viewBox", [0, 0, self.width, self.height].join(" "));
  }

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.SVG
      .attr("width", width)
      .attr("height", height);
  }

  function drawTimeChart(fingerData) {
    let margin = {
      top: 5,
      bottom: 20,
      left: 20,
      right: 15
    };

    self.SVG.selectAll("*").remove();

    let maxFingers = d3.max(Object.values(fingerData), r => d3.max(r, t => t.length));
    let timeLength = Object.values(fingerData)[0].length - 1;

    self.timeScale = d3.scaleLinear()
      .domain([0, timeLength])
      .range([margin.left, self.width - margin.right]);

    self.fingerScale = d3.scaleLinear()
      .domain([0, maxFingers])
      .range([self.height - margin.bottom, margin.top]);

    let xAxis = d3.axisBottom(self.timeScale)
      .ticks(13);
    let yAxis = d3.axisLeft(self.fingerScale)
      .tickValues([0, 11, 22, 33]);


    self.SVG.append("g")
      // .attr("class", "axis axis--x")
      .attr("transform", "translate(" + 0 + ", " + (self.height - margin.bottom) + ")")
      .call(xAxis);

    self.SVG.append("g")
      // .attr("class", "axis axis--y")
      .attr("transform", "translate(" + margin.left + ", " + 0 + ")")
      .call(yAxis);

    // draw lines for data
    let line = d3.line()
      .x((d, i) => self.timeScale(i))
      .y(d => self.fingerScale(d.length));

    self.runPaths = self.SVG.append("g")
      .attr("class", "runPathsGroup");

    self.runPaths.selectAll(".runPath")
      .data(Object.keys(fingerData))
      .enter().append("path")
      .attr("class", "runPath")
      .attr("d", function(d) {
        return line(fingerData[d]);
      })
      .classed("currentRunPath", d => parseInt(d.substr(-2)) == App.state.currentRun);

    self.runPaths.selectAll(".currentRunPath").raise();

    // create brush
    let brush = self.brush = d3.brushX()
      .handleSize(4)
      .on("end", brushEnd)
      .extent([
        [margin.left, margin.top],
        [self.width - margin.right, self.height - margin.bottom]
      ]);

    let brushG = self.brushG = self.SVG.append("g")
      .attr("class", "brush")
      .on("click", function() {console.log("click"); d3.event.preventDefault();})
      .call(brush);

    brushG.selectAll(".selection")
      .style("fill-opacity", 0.1);

    brushG.call(brush.move, [self.timeScale(self.currentSelection[0]), self.timeScale(self.currentSelection[1])])

    function brushEnd() {
      if (!d3.event.sourceEvent) return; // Only transition after input

      let brushDomain = [0, 120];
      if (!d3.event.selection) {
        brushDomain = self.currentSelection;
      } else {
        let selection = d3.event.selection;
        let startTime = Math.round(self.timeScale.invert(selection[0]) / 5) * 5;
        let endTime = Math.round(self.timeScale.invert(selection[1]) / 5) * 5;

        if (startTime === endTime) {
          endTime += 5;
        }

        brushDomain = self.currentSelection = [
          startTime,
          endTime
        ];
      }

      let newBrushPos = [self.timeScale(brushDomain[0]), self.timeScale(brushDomain[1])];

      d3.select(this).transition().call(d3.event.target.move, newBrushPos);

      App.controllers.timeWindow.timeWindowBrushUpdated(brushDomain);
    }
  }

  function updateBrushTimeWindow(newWindow) {
    self.currentSelection = newWindow;

    self.brushG.call(self.brush.move, [self.timeScale(self.currentSelection[0]), self.timeScale(self.currentSelection[1])]);
  }

  function updateSelectedRun(selectedRun) {
    self.runPaths.selectAll(".runPath")
      .classed("currentRunPath", d => parseInt(d.substr(-2)) == App.state.currentRun);

    self.runPaths.selectAll(".currentRunPath").raise();
  }

  function updateHoveredRun(hoveredRun) {
    self.runPaths.selectAll(".runPath")
      .classed("hoveredRunPath", d => parseInt(d.substr(-2)) == hoveredRun);

    self.runPaths.selectAll(".hoveredRunPath").raise();
  }

  return {
    resize,
    drawTimeChart,
    updateBrushTimeWindow,
    updateSelectedRun,
    updateHoveredRun
  };
};
