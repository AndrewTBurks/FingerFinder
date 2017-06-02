"use strict";

var App = App || {};

let FlowSlabController = function(div) {
  let self = {
    div:
  };

  init();

  function init() {
    self.div = d3.select(div);
  }

  function slabUpdated() {
    App.views.flow.calculateSlabbedPoints();
  }

  return {
    slabUpdated
  };
};
