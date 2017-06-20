"use strict";

var App = App || {};

less.pageLoadFinished.then(function() {
  console.log("less - pageLoadFinished");
  App.init();
});

window.onresize = function (){
  App.resize()
};

(function() {
  // set up objects to hang MVC off of
  App.models = {};
  App.views = {};
  App.controllers = {};

  // set up state of application
  App.state = {};
  App.state.currentTimestep = 1;
  App.state.currentRun = 1;
  App.state.colorScheme = "Viridis";

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

    // create legends
    let currentColormap = App.colormaps[App.state.colorScheme];
    App.views.flowLegend = new ColorLegend("#flowLegend");
    App.views.flowLegend.setColors(currentColormap);
    App.views.kiviatLegend = new ColorLegend("#kiviatLegend");
    App.views.kiviatLegend.setColors(currentColormap);

    // initialize Controllers
    App.controllers.upperDropdowns = new UpperDropdownController();
    App.controllers.upperDropdowns.attachRunDropdown("#runSelect");
    App.controllers.upperDropdowns.attachTimeDropdown("#timestepSelect");
    App.controllers.upperDropdowns.attachColorDropdown("#colorSelect");

    App.controllers.flowColorMode = new FlowColorModeController();
    App.controllers.flowColorMode.attachColorModeDropdown("#flowColoringSelect");

    App.controllers.flowSlab = new FlowSlabController("#flowControls");

    App.controllers.timeWindow = new TimeWindowController();

    // load data then initialize views with data
    loadAllData();
  };

  App.resize = function() {
    for (let view of Object.keys(App.views)) {
      // console.log("Resizing " + view);
      App.views[view].resize();
    }

    App.controllers.flowSlab.resize();
  }

  function loadAllData() {
    App.models.simulationData.getData(App.state.currentRun, App.state.currentTimestep)
      .then(function(data) {
        let pointData = data[0];
        let clusterData = data[1];
        // console.log(clusterData);

        // use simulation Data
        let timestepDataStats = App.models.simulationData.getStats();

        App.views.flowLegend.setExtents([
          timestepDataStats.mean + (timestepDataStats.stdDev / 8),
          timestepDataStats.extent[1]
        ]);

        App.views.flow.updateViewWithNewData(pointData, clusterData);
        App.controllers.flowSlab.slabUpdated();

        App.views.fingerForest.updateColorScale();
      })
      .catch(function(err) {
        console.log(err);
      });

    // App.models.runSummary.getClusterCenters()
    App.models.runSummary.getClusterCenters()
      .then(function(clusterData) {
        App.views.timeChart.drawTimeChart(clusterData);
        App.views.fingerForest.importClusterData(clusterData);

        // initialize the time window to be 30-50
        App.controllers.timeWindow.setTimeWindow([30, 50]);

        return clusterData;
      })
      .then(App.models.runSummary.getClusterSummary)
      .then(function(summaryData) {
        // use summary data
        // TODO: allow for kiviat coloring changes
        App.views.kiviatLegend.setExtents(summaryData.extents.totalClusters);
        App.views.kiviatSummary.drawKiviats(summaryData);
        App.views.kiviatSummary.changeSelectedRun(App.state.currentRun);
      })
      .catch(function(err) {
        console.log(err);
      });
  }
})();
