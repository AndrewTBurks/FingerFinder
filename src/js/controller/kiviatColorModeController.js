"use strict";

var App = App || {};

let KiviatColorMode = function() {
  let self = {
    select: null,

    scaleRanges: null
  };

  function attachColorModeDropdown(id) {
    self.select = d3.select(id)
      .on("change", handleModeChange);

    // populate with options
    for (let property of App.singleProperties) {
      self.select.append("option")
        .text(App.summaryPropertyToText[property].abbr)
        .attr("value", property);
    }

    // populate with options
    for (let property of App.averagedProperties) {
      self.select.append("option")
        .text(App.summaryPropertyToText[property].abbr)
        .attr("value", property);
    }
  }

  function handleModeChange() {
    let mode = self.select.node().value;


    App.views.kiviatLegend.setExtents(self.scaleRanges[mode]);
    let kiviatScale = App.views.kiviatLegend.getColorOf;

    App.views.kiviatSummary.setColoredProperty(mode);
    App.views.kiviatSummary.changeColorScale(kiviatScale);
  }

  function saveScaleRanges(summaryData) {
    self.scaleRanges = {};

    // populate with options
    for (let property of App.singleProperties) {
      self.scaleRanges[property] = summaryData.extents[property];
    }

    // populate with options
    for (let property of App.averagedProperties) {
      self.scaleRanges[property] = summaryData.extents[property].avg;
    }
  }

  return {
    attachColorModeDropdown,

    saveScaleRanges
  };
};
