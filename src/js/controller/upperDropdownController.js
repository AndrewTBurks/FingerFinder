"use strict";

var App = App || {};

let UpperDropdownController = function() {
  let self = {
    colorDropdown: null,
    runDropdown: null,
    timeDropdown: null
  };

  // color dropdown
  function attachColorDropdown(id) {
    self.colorDropdown = d3.select(id);

    // populate Dropdown


    // attach listener
    self.colorDropdown
      .on("change", colorDropdownOnChange);
  }

  function colorDropdownOnChange() {

  }

  // run dropdown
  function attachRunDropdown(id) {
    self.runDropdown = d3.select(id);

    // populate Dropdown


    // attach listener
    self.runDropdown
      .on("change", runDropdownOnChange);
  }

  function runDropdownOnChange() {

  }

  // time dropdown
  function attachTimeDropdown(id) {
    self.timeDropdown = d3.select(id);
    
    // populate Dropdown


    // attach listener
    self.timeDropdown
      .on("change", timeDropdownOnChange);

  }

  function timeDropdownOnChange() {

  }

  return {
    attachColorDropdown,
    attachRunDropdown,
    attachTimeDropdown
  };
};
