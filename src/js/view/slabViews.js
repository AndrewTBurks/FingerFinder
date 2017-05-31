"use strict";

var App = App || {};

let SlabViews = function(concDiv, vecDiv) {
  let self = {
    concDiv: null,
    concSVG: null,
    vecDiv: null,
    vecSVG: null
  };

  init();

  function init() {
    self.concDiv = d3.select(concDiv);
    self.vecDiv = d3.select(vecDiv);

    setupSVG();
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
  }

  function updateSlice(slicedPoints) {

  }

  return {
    updateViewsWithNewSlice: updateSlice
  };
};
