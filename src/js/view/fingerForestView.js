"use strict";

var App = App || {};

let FingerForestView = function(div) {
  let self = {
    div: null,
    SVG: null
  };

  init();

  function init() {
    self.div = d3.select(div);

    setupSVG();
  }

  function setupSVG() {
    // these will remain squares and will not fill space completely
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.SVG = self.div
    .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "));
  }

  return {

  };
};
