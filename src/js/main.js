"use strict";

var App = App || {};

less.pageLoadFinished.then(function() {
  console.log("less - pageLoadFinished");
  App.init();
});

(function() {
  // set up objects to hang MVC off of
  App.models = {};
  App.views = {};
  App.controllers = {};

  // set up state of application
  App.state = {};
  App.state.currentTimestep = 1;
  App.state.currentRun = 1;

  // set up constants
  App.NUM_TIMESTEPS = 120; // 1 to 120 (exclude 0 as it has no data)
  App.NUM_RUNS = 20; // 1 to 20

  App.init = function() {
    console.log("In App.init()");

    // initialize Models
    App.models.simulationData = new SimulationDataModel();
    App.models.runSummary = new RunSummaryModel();

    // initialize Views
    App.views.slabs = new SlabViews("#concentrationHeatmap", "#velocityVectorField");
    App.views.flow = new FlowView("#flowView");
    App.views.timeChart = new TimeChartView("#timeChart");
    App.views.fingerForest = new FingerForestView("#fingerForest");
    App.views.kiviatSummary = new KiviatView("#kiviatSummary");

    // initialize Controllers


    // load data then initialize views with data
    loadAllData();
  };

  function loadAllData() {
    App.models.simulationData.getData(App.state.currentRun, App.state.currentTimestep)
      .then(function(data) {
        // use simulation Data
        // console.log(data);
      })
  }
})();
