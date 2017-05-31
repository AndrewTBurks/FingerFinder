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
    console.log("Color Scheme changed to: " + dropdown.node().value);

    App.state.colorScheme = dropdown.node().value;

    App.views.flowLegend.setColors(App.colormaps[App.state.colorScheme]);
    App.views.kiviatLegend.setColors(App.colormaps[App.state.colorScheme]);
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
    console.log("Run changed to: " + dropdown.node().value);

    App.state.currentRun = dropdown.node().value;

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
    console.log("Timestep changed to: " + dropdown.node().value);

    App.state.currentTimestep = dropdown.node().value;

    // retrieve new data and update views
    timeOrRunChange();
  }

  function timeOrRunChange() {
    App.models.simulationData.getData(App.state.currentRun, App.state.currentTimestep)
      .then(function(data) {
        console.log("Data Updated");
      });
  }

  return {
    attachColorDropdown,
    attachRunDropdown,
    attachTimeDropdown
  };
};
