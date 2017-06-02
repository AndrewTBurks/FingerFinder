"use strict";

var App = App || {};

let FlowSlabController = function(div) {
  let self = {
    div: null
  };

  init();

  function init() {
    self.div = d3.select(div);
  }

  function slabMoved() {
    let newZ = 0; // get z from slider

    App.views.flow.updateSlabPosition(newZ);
  }

  function slabUpdated() {
    App.views.flow.calculateSlabbedPoints();
    App.views.flow.changeColorScale(App.views.flowLegend.getColorOf);
  }

  return {
    slabUpdated
  };
};
