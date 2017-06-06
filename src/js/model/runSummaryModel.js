"use strict";

var App = App || {};

let RunSummaryModel = function() {
  let self = {
    clusterCenters: null
  };

  function init() {
    self.clusterCenters = {};

    console.log(self.clusterCenters)
  }

  function loadAllClusterCenters() {
    let runs = d3.range(1, 21);
  }

  return {

  };
};
