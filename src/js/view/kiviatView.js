"use strict";

var App = App || {};

let KiviatView = function(div) {
  let self = {
    div: null,
    wrapper: null
  };

  init();

  function init() {
    self.div = d3.select(div);

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
  }

  function drawKiviats(summaryData) {
    console.log("Drawing Kiviats for:", summaryData);
  }

  function rotate(x) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

  function updateKiviatColors(colorScale) {

  }

  return {
    resize,
    drawKiviats,
    updateKiviatColors
  };
};
