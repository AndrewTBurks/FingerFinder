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

    slabUpdated();
  }

  // the slab may be updated by rotation so route this interaction information
  // into this controller function
  function slabUpdated() {
    App.views.flow.calculateSlabbedPoints();

    App.views.flow.changeColorScale(App.views.flowLegend.getColorOf);

    let slabData = App.views.flow.getSlabbedPoints();

    App.views.slabs.updateViewsWithNewSlab(slabData, App.views.flowLegend.getColorOf);
  }

  return {
    slabUpdated
  };
};
