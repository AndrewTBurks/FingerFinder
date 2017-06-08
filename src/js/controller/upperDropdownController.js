"use strict";

var App = App || {};

let UpperDropdownController = function() {
  let self = {
    colorDropdown: null,
    runDropdown: null,
    timeDropdown: null,

  };

  // color dropdown
  function attachColorDropdown(id) {
    self.colorDropdown = d3.select(id);

    // populate Dropdown
    let colorSchemes = ["Viridis", "Magma", "Inferno", "Plasma"];

    self.colorDropdown.selectAll("option")
      .data(colorSchemes)
      .enter().append("option")
      .text(d => d);

    // attach listener
    self.colorDropdown
      .on("change", colorDropdownOnChange);
  }

  function colorDropdownOnChange() {
    let dropdown = d3.select(this);

    App.state.colorScheme = dropdown.node().value;

    // change flow legend and dependents
    App.views.flowLegend.setColors(App.colormaps[App.state.colorScheme]);
    let scale = App.views.flowLegend.getColorOf;

    App.views.flow.setBackgroundColor(App.flowBG[App.state.colorScheme]);
    // App.views.flow.setBackgroundColor("#1C2329");
    App.views.flow.changeColorScale(scale);

    App.views.slabs.setBackgroundColor(App.flowBG[App.state.colorScheme]);
    // App.views.slabs.setBackgroundColor("#1C2329");
    App.views.slabs.changeColorScale(scale);

    App.views.kiviatLegend.setColors(App.colormaps[App.state.colorScheme]);
    let kiviatScale = App.views.kiviatLegend.getColorOf;
    App.views.kiviatSummary.changeColorScale(kiviatScale);

    let newMainColor = "#" + App.colormaps[App.state.colorScheme][Math.floor(App.colormaps[App.state.colorScheme].length / 2)];
    let newStrokeColor = "#" + App.colormaps[App.state.colorScheme][Math.floor(3 * App.colormaps[App.state.colorScheme].length / 8)];

    less.modifyVars({
      '@button-border': newStrokeColor,
      '@focus-border': newMainColor
    });
  }

  // run dropdown
  function attachRunDropdown(id) {
    self.runDropdown = d3.select(id);

    // populate Dropdown
    let runs = d3.range(1, 21);

    self.runDropdown.selectAll("option")
      .data(runs)
      .enter().append("option")
      .attr("disabled", function(d) {
        return (d == 13 || d == 15) ? true : null;
      }) // 13 and 15 not included in data...
      .text(d => d);

    // attach listener
    self.runDropdown
      .on("change", runDropdownOnChange);
  }

  function runDropdownOnChange() {
    let dropdown = d3.select(this);

    App.state.currentRun = dropdown.node().value;
    App.views.kiviatSummary.changeSelectedRun(App.state.currentRun);

    // retrieve new data and update views
    timeOrRunChange();
  }

  // time dropdown
  function attachTimeDropdown(id) {
    self.timeDropdown = d3.select(id);

    // populate Dropdown
    let timesteps = d3.range(1, 121);

    self.timeDropdown.selectAll("option")
      .data(timesteps)
      .enter().append("option")
      .text(d => d);

    // attach listener
    self.timeDropdown
      .on("change", timeDropdownOnChange);

  }

  function timeDropdownOnChange() {
    let dropdown = d3.select(this);

    App.state.currentTimestep = dropdown.node().value;

    // retrieve new data and update views
    timeOrRunChange();
  }

  function timeOrRunChange() {
    App.models.simulationData.getData(App.state.currentRun, App.state.currentTimestep)
      .then(function(data) {
        let pointData = data[0];
        let clusterData = data[1];

        let timestepDataStats = App.models.simulationData.getStats();

        App.views.flowLegend.setExtents([
          timestepDataStats.mean + (timestepDataStats.stdDev / 8),
          timestepDataStats.extent[1]
        ]);

        App.views.flow.updateViewWithNewData(pointData, clusterData);
        App.controllers.flowSlab.slabUpdated();
      });
  }

  function changeCurrentRun(newRun) {
    let dropdown = self.runDropdown;

    dropdown.node().value = newRun;

    App.state.currentRun = dropdown.node().value;
    App.views.kiviatSummary.changeSelectedRun(App.state.currentRun);

    timeOrRunChange();
  }

  return {
    attachColorDropdown,
    attachRunDropdown,
    attachTimeDropdown,

    changeCurrentRun
  };
};
