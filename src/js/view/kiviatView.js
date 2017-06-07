"use strict";

var App = App || {};

let KiviatView = function(div) {
  let self = {
    div: null,
    wrapper: null,

    scales: null
    mode: "avg" // or "ext"
  };

  init();

  function init() {
    self.div = d3.select(div);
    self.scales = {};

    setupWrapper();
  }

  function setupWrapper() {
    // these will remain squares and will not fill space completely
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.wrapper = self.div
      .append("div")
      .attr("class", "kiviatWrapper")
      .style("width", width + "px")
      .style("height", height + "px");
  }

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.wrapper
      .style("width", width + "px")
      .style("height", height + "px");

    // resize the SVGs inside
    let wrapperPadding = parseInt(self.wrapper.style("padding"));
    let squareSide = calculateSquareSideLength(
      width - wrapperPadding * 2,
      height - wrapperPadding * 2,
      20
    );

    self.wrapper.selectAll(".kiviatSVG")
      .attr("width", squareSide)
      .attr("height", squareSide);
  }

  function drawKiviats(summaryData) {
    let runNums = d3.range(1, 21);

    self.scales = {};

    // find square edge max size
    let wrapperPadding = parseInt(self.wrapper.style("padding"));
    console.log(wrapperPadding);

    // calculate x, y of space for svgs and number of runs
    let x = parseInt(self.wrapper.style("width")) - wrapperPadding * 2,
      y = parseInt(self.wrapper.style("height")) - wrapperPadding * 2,
      n = 20;

    let squareSide = calculateSquareSideLength(x, y, n);

    console.log("Drawing Kiviats for:", summaryData);

    self.wrapper.selectAll(".kiviatSVG")
      .data(runNums)
      .enter().append("svg")
      .attr("class", "kiviatSVG")
      .attr("viewBox", [0, 0, 100, 100].join(" "))
      .attr("width", squareSide)
      .attr("height", squareSide)
      .each(function(d, i) {
        let runName = "run" + ('0' + d).substr(-2);

        d3.select(this).call(createKiviat, d, summaryData.runs[runName]);
      });
  }

  function createKiviat(svg, runNum, runData) {
    // console.log(runNum, runData);

  }

  function rotate(x) {
    var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * x,
      ny = sin * x
    return {
      x: nx,
      y: ny
    };
  }

  function calculateSquareSideLength(x, y, n) {
    let sx, sy;

    let px = Math.ceil(Math.sqrt(n * x / y));

    if (Math.floor(px * y / x) * px < n) { // does not fit, y/(x/px)=px*y/x
      sx = y / Math.ceil(px * y / x);
    } else {
      sx = x / px;
    }

    let py = Math.ceil(Math.sqrt(n * y / x));
    if (Math.floor(py * x / y) * py < n) { // does not fit
      sy = x / Math.ceil(x * py / y);
    } else {
      sy = y / py;
    }

    return Math.max(sx, sy);
  }

  function updateKiviatColors(colorScale) {

  }

  function changeMode(newMode) {
    self.mode = newMode;
  }

  return {
    resize,
    drawKiviats,
    updateKiviatColors,
    changeMode
  };
};
