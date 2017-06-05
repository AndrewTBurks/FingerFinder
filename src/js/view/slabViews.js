"use strict";

var App = App || {};

let SlabViews = function(concDiv, vecDiv) {
  let self = {
    concDiv: null,
    concSVG: null,
    vecDiv: null,
    vecSVG: null,

    concTileGroup: null,
    vecTileGroup: null,

    concAggr: null,
    velAggr: null,
    xScale: null,
    yScale: null,

    NUM_BINS: 50,
    binWidth: null
  };

  init();

  function init() {
    self.concDiv = d3.select(concDiv);
    self.vecDiv = d3.select(vecDiv);

    // 2 arrays of [...., [..., [], ...], ...]
    self.concAggr = _.map(new Array(50), o => _.map(new Array(50), p => []));
    self.vecAggr = _.map(new Array(50), o => _.map(new Array(50), p => []));

    self.concVals = _.map(new Array(50), o => _.map(new Array(50), p => 0));
    self.vecVals = _.map(new Array(50), o => _.map(new Array(50), p => 0));

    setupSVG();
    setupTileGroups();
  }

  function setupSVG() {
    // these will remain squares and will not fill space completely
    let elemNode = self.concDiv.node();
    let title = self.concDiv.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    let dimension = d3.min([width, height]);

    self.concSVG = self.concDiv
      .append("svg")
      .attr("width", dimension)
      .attr("height", dimension)
      .attr("viewBox", [0, 0, dimension, dimension].join(" "));

    self.vecSVG = self.vecDiv
      .append("svg")
      .attr("width", dimension)
      .attr("height", dimension)
      .attr("viewBox", [0, 0, dimension, dimension].join(" "));

    self.binWidth = dimension / self.NUM_BINS;
  }

  function updateSlabs(slicedPoints, colorScale) {
    // aggragate sliced points into 2x2 array
    // then take mean of values in array

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        self.concAggr[x][y] = [];
        self.vecAggr[x][y] = [];
      }
    }

    for (let point of Object.values(slicedPoints)) {
      let mapping = getArrayCoordinate(point.pos);

      self.concAggr[mapping.x][mapping.y].push(point.conc);
      self.vecAggr[mapping.x][mapping.y].push(point.vel);
    }

    self.concVals = _.map(new Array(50), (o, x) => {
      return _.map(new Array(50), (p, y) => {
        let concVals = self.concAggr[x][y];
        let concAvg = concVals.length === 0 ? null : d3.mean(concVals);

        return concAvg;
      });
    });

    self.vecVals = _.map(new Array(50), (o, x) => {
      return _.map(new Array(50), (p, y) => {
        let vecVals = self.vecAggr[x][y];

        let vecAvg = vecVals.length === 0 ? {
          x: 0,
          y: 0
        } : {
          x: d3.mean(vecVals, v => v.x),
          y: d3.mean(vecVals, v => v.y)
        };

        return vecAvg;
      });
    });



    // concentration tiles
    self.concTileGroup.selectAll(".concTile")
      .style("fill", d => self.concVals[d.x][d.y] == null ? "none" : colorScale(self.concVals[d.x][d.y]));

    self.vecTileGroup.selectAll(".vecTile")
      .each(function(d) {
        let tile = d3.select(this);
        let color = self.concVals[d.x][d.y] == null ? "none" : colorScale(self.concVals[d.x][d.y]);

        tile.select("rect")
          .style("fill", color);

        tile.select("path")
          .style("fill", color)
          .style("stroke", color)
          .attr("d", createPath);
      });

    // d will be a location {x: _, y: _} from a tile
    function createPath(d) {
      let vec = self.vecVals[d.x][d.y];

      return "M 0,0 l " + (vec.x * self.binWidth * 3) + "," + (-vec.y * self.binWidth * 3);
    }

    function getArrayCoordinate(pos) {
      let coord = {
        x: Math.floor((pos.x + 5) * 5),
        y: Math.floor((10 - pos.y) * 5)
      };

      if (coord.x > 49) coord.x = 49;
      if (coord.y > 49) coord.y = 49;

      return coord;
    }
  }

  function setupTileGroups() {
    // [0, 49]
    // x: [-5, 5]
    // y: [0,10]
    let locations = [];
    let startingColor = d3.scaleOrdinal(d3.schemeCategory20);

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        locations.push({
          x,
          y
        });
      }
    }

    self.concTileGroup = self.concSVG.append("g")
      .attr("class", "concTileGroup");

    // concentration tiles
    self.concTileGroup.selectAll(".concTile")
      .data(locations).enter()
      .append("rect")
      .attr("class", "concTile")
      .attr("transform", d => "translate(" + (d.x * self.binWidth) + "," + (d.y * self.binWidth) + ")")
      .attr("width", self.binWidth)
      .attr("height", self.binWidth)
      .style("fill", d => startingColor(d.x + d.y));


    self.vecTileGroup = self.vecSVG.append("g")
      .attr("class", "vecTileGroup");

    self.vecTileGroup.selectAll(".vecTile")
      .data(locations).enter()
      .append("g")
      .attr("class", "vecTile")
      .attr("transform", d => "translate(" + (d.x * self.binWidth) + "," + (d.y * self.binWidth) + ")")
      .each(function(d) {
        let tile = d3.select(this);

        tile.append("rect")
          .attr("class", "concValue")
          .attr("width", self.binWidth)
          .attr("height", self.binWidth)
          .style("opacity", 0.5)
          .style("fill", d => startingColor(d.x + d.y));

        tile.append("path")
          .attr("class", "velVec")
          .attr("transform", "translate(" + (self.binWidth / 2) + "," + (self.binWidth / 2) + ")")
          .attr("d", "")
          .style("stroke-width", 1.5)
          .style("fill", "black");
      });
  }

  function changeColorScale(colorScale) {
    self.concTileGroup.selectAll(".concTile")
      .style("fill", d => self.concVals[d.x][d.y] == null ? "none" : colorScale(self.concVals[d.x][d.y]));

    self.vecTileGroup.selectAll(".vecTile")
      .each(function(d) {
        let tile = d3.select(this);
        let color = self.concVals[d.x][d.y] == null ? "none" : colorScale(self.concVals[d.x][d.y]);

        tile.select("rect")
          .style("fill", color);

        tile.select("path")
          .style("fill", color)
          .style("stroke", color);
      });
  }

  function setBackgroundColor(color) {
    self.concSVG.style("background", color);
    self.vecSVG.style("background", color);
  }

  function resize() {
    let elemNode = self.concDiv.node();
    let title = self.concDiv.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    let dimension = d3.min([width, height]);

    self.concSVG
      .attr("width", dimension)
      .attr("height", dimension);

    self.vecSVG
      .attr("width", dimension)
      .attr("height", dimension);
  }

  return {
    updateViewsWithNewSlab: updateSlabs,
    changeColorScale,
    setBackgroundColor,
    resize
  };
};
