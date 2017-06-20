"use strict";

var App = App || {};

let KiviatView = function(div) {
  let self = {
    div: null,
    wrapper: null,

    scales: null,
    mode: "avg", // "avg" or "ext"
    coloredProperty: "totalClusters",

    axisTip: null,
    helpTip: null
  };

  init();

  function init() {
    self.div = d3.select(div);
    self.scales = {};

    self.axisTip = d3.tip()
      .attr('class', 'd3-tip')
      .direction("w")
      .offset([0, -10])
      .html(function(d) {
        return "<strong>" + d.name + ":</strong><br><span class='valueText'>" + d.value.toFixed(2) + "</span>";
      });

    self.helpTip = d3.tip()
      .attr('class', 'd3-tip')
      .direction("e")
      .offset([0, 10])
      .html(function(d) {
        let domain = _.includes(App.singleProperties, d) ?
          self.scales[d].domain() :
          self.scales[d][self.mode].domain();
        let name = App.summaryPropertyToText[d].name;
        let description = App.summaryPropertyToText[d].desc;

        return "<strong>" + name + ": </strong><br><span class='valueText'>[" + domain[0].toFixed(2) + ", " + domain[1].toFixed(2) + "]</span><br>" + description;
      });

    setupWrapper();
  }

  function setupWrapper() {
    // these will remain squares and will not fill space completely
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    // calculate width and height boundaries for div
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

    // recalculate width and height available to the kiviats
    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.wrapper
      .style("width", width + "px")
      .style("height", height + "px");

    // resize the SVGs inside
    let wrapperPadding = parseInt(self.wrapper.style("padding-top"));
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

    let svgViewboxDimension = 100;
    let axisRange = [5, (svgViewboxDimension / 2) - 5]

    // create d3 scales for each property of the kiviats

    self.scales = {};
    self.propertyToAxisNum = {};
    let axisNum = 0;

    for (let property of App.singleProperties) {
      self.scales[property] = d3.scaleLinear()
        .domain(summaryData.extents[property])
        .range(axisRange);

      self.propertyToAxisNum[property] = axisNum++;
    }

    for (let property of App.averagedProperties) {
      self.scales[property] = {
        avg: d3.scaleLinear()
          .domain(summaryData.extents[property].avg)
          .range(axisRange),
        ext: d3.scaleLinear()
          .domain(summaryData.extents[property].ext)
          .range(axisRange)
      };

      self.propertyToAxisNum[property] = axisNum++;
    }

    // find square edge max size
    let wrapperPadding = parseInt(self.wrapper.style("padding-top"));

    // calculate x, y of space for svgs and number of runs
    let x = parseInt(self.wrapper.style("width"), 10) - wrapperPadding * 2,
      y = parseInt(self.wrapper.style("height"), 10) - wrapperPadding * 2,
      n = 20;

    let squareSide = calculateSquareSideLength(x, y, n);

    // data bind to create svgs of the squareSide dimension
    self.wrapper.selectAll(".kiviatSVG")
      .data(runNums)
      .enter().append("svg")
      .attr("class", "kiviatSVG")
      .attr("viewBox", [0, 0, svgViewboxDimension, svgViewboxDimension].join(" "))
      .attr("width", squareSide)
      .attr("height", squareSide)
      .each(function(d, i) {
        let runName = "run" + ('0' + d).substr(-2);

        // create text showing what the number of the current run is
        d3.select(this).append("text")
          .attr("class", "runNum")
          .attr("text-anchor", "left")
          .attr("x", 4)
          .attr("y", 12)
          // .style("font-size", "10px")
          .text(d)
          .on("click", function() {
            if (summaryData.runs[runName]) {
              App.controllers.upperDropdowns.changeCurrentRun(d);
            }
          });

        // create the actual kiviat diagram, translated to be centered within the svg
        d3.select(this)
          .append("g")
          .attr("class", "kiviatGroup")
          .attr("transform", "translate(50, 50)")
          .call(createKiviat, d, summaryData.runs[runName])
          .call(self.axisTip)
          .call(self.helpTip);
      });
  }

  // method to create and append a kiviat to an el (either svg or group)
  function createKiviat(el, runNum, runData) {
    // if a run has no data, don't create the plot
    if (!runData) {
      return;
    }

    // get the number of axes
    let numKiviatProperties = App.singleProperties.length + App.averagedProperties.length;

    // draw the plot axes
    drawAxes(el, Object.keys(self.scales).length, runData);


    // if the mode is average (one value for each property)
    if (self.mode === "avg") {
      // coordinates of path
      let coords = [];

      // get coords of properties with single values
      for (let property of App.singleProperties) {
        let coord = rotate(
          self.scales[property](runData[property]),
          self.propertyToAxisNum[property] * 360 / numKiviatProperties
        );

        coords.push(coord);
      }

      // get coords of properties which have both average and extent
      for (let property of App.averagedProperties) {
        let coord = rotate(
          self.scales[property].avg(runData[property].avg),
          self.propertyToAxisNum[property] * 360 / numKiviatProperties
        );

        coords.push(coord);
      }

      // create a path by joining these coordinates together
      el.append("path")
        .attr("class", "kiviatShape")
        .datum(runData)
        .attr("d", ("M" + _.map(coords, e => " " + e.x + " " + e.y + " ").join("L") + "Z"))
        .style("fill", App.views.kiviatLegend.getColorOf(runData[self.coloredProperty]));

    } else if (self.mode === "ext") { // value range for each property
      // outer coordinates (i.e. maximum extent)
      let outerCoords = [];

      // inner coordinates (i.e. minimum extent)
      let innerCoords = [];

      // get coords of properties with single values
      for (let property of App.singleProperties) {
        let coord = rotate(
          self.scales[property](runData[property]),
          self.propertyToAxisNum[property] * 360 / numKiviatProperties
        );

        outerCoords.push(coord);
        innerCoords.push(coord);
      }

      // get coords of properties which have both average and extent
      for (let property of App.averagedProperties) {
        let outerPoint = rotate(
          self.scales[property].ext(runData[property].ext[1]),
          self.propertyToAxisNum[property] * 360 / numKiviatProperties
        );

        let innerPoint = rotate(
          self.scales[property].ext(runData[property].ext[0]),
          self.propertyToAxisNum[property] * 360 / numKiviatProperties
        );

        outerCoords.push(outerPoint);
        innerCoords.push(innerPoint);
      }

      // create the path by joining the coords of outer into one path, then inner into another
      // by using fill-rule evenodd, the inside will be cut out
      el.append("path")
        .attr("class", "kiviatShape")
        .datum(runData)
        .attr("fill-rule", "evenodd")
        .attr("d",
          ("M" + _.map(outerCoords, e => " " + e.x + " " + e.y + " ").join("L") + "Z") + " " +
          ("M" + _.map(innerCoords, e => " " + e.x + " " + e.y + " ").join("L") + "Z")
        )
        .style("fill", App.views.kiviatLegend.getColorOf(runData[self.coloredProperty]));
    }

    // for the first run, draw more tips on the axes
    if (runNum === 1) {
      el.selectAll(".helperCircle")
        .data(Object.keys(self.scales))
        .enter().append("circle")
        .attr("class", "helperCircle")
        .attr("r", 4)
        .each(function(d, i, nodes) {
          let circle = d3.select(this);

          let axisNum = self.propertyToAxisNum[d];
          let angle = axisNum * 360 / nodes.length;

          let position = rotate(45, angle);

          circle
            .attr("cx", position.x)
            .attr("cy", position.y)
        })
        .on("mouseover", self.helpTip.show)
        .on("mouseout", self.helpTip.hide);
    }
  }

  function drawAxes(el, count, runData) {
    // make a group for all of the axes
    let axesGroup = el.append("g")
      .attr("class", "axesGroup");

    // draw lines for axes
    axesGroup.selectAll(".kiviatAxis")
      .data(d3.range(count))
      .enter().append("line")
      .attr("class", "kiviatAxis")
      .attr("x0", 0)
      .attr("y0", 0)
      .each(function(d) {
        let axis = d3.select(this);
        let rotatedEnd = rotate(45, d * 360 / count);
        axis.attr("x1", rotatedEnd.x);
        axis.attr("y1", rotatedEnd.y);
      })
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .datum(d => {
        let prop = Object.keys(self.scales)[d];

        return {
          name: App.summaryPropertyToText[prop].name,
          value: _.includes(App.singleProperties, prop) ?
            runData[prop] : runData[prop][self.mode]
        };
      })
      .attr("class", "kiviatAxisHelper")
      .on("mouseover", self.axisTip.show)
      .on("mouseout", self.axisTip.hide);
  }

  function rotate(x, angle) {
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

  // algorithm to calculate square side length for n squares within an
  // x by y rectangle
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

  // update the colors of the kiviat diagrams
  function changeColorScale(colorScale) {
    self.wrapper.selectAll(".kiviatSVG")
      .selectAll(".kiviatShape")
      .style("fill", d => {
        return colorScale(d[self.coloredProperty]);
      })
  }

  // TODO: change the kiviats on mode change? maybe not include this
  function changeMode(newMode) {
    self.mode = newMode;
  }

  // change the selected run (update class of run number and kiviat shape)
  function changeSelectedRun(num) {
    self.wrapper.selectAll(".kiviatSVG")
      .each(function(d) {
        let svg = d3.select(this);
        svg.selectAll(".runNum")
          .classed("runNumActive ", d == num)
          // .style("font-size", d == num ? "14px" : "10px");

        svg.selectAll(".kiviatShape")
          .classed("kiviatShapeActive", function(d2) {
            return d == num;
          });
      });
  }

  return {
    resize,
    drawKiviats,
    changeColorScale,
    changeMode,
    changeSelectedRun
  };
};
