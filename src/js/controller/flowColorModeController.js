"use strict";

var App = App || {};

let FlowColorModeController = function() {
  let self = {
    select: null
  };

  function attachColorModeDropdown(id) {
    self.select = d3.select(id)
      .on("change", handleModeChange);
  }

  function handleModeChange() {
    let mode = self.select.node().value;

    App.views.flow.setFlowColorMode(mode);
    App.views.flow.changeColorScale(App.views.flowLegend.getColorOf);
  }

  function setFlowColorMode(mode) {
    self.select.node().value = mode;


    App.views.flow.setFlowColorMode(mode);
    App.views.flow.changeColorScale(App.views.flowLegend.getColorOf);
  }

  return {
    attachColorModeDropdown,
    setFlowColorMode
  };
};
