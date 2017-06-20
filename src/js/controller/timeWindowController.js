"use strict";

var App = App || {};

let TimeWindowController = function() {
  let self = {
    currentWindow: []
  };

  // manually set time window, update brush and finger forest
  function setTimeWindow(newWindow) {
    self.currentWindow = newWindow;

    App.views.timeChart.updateBrushTimeWindow(newWindow);
    App.views.fingerForest.drawFingerForest(newWindow);
  }

  // called on time chart brush end
  function timeWindowBrushUpdated(newWindow) {
    self.currentWindow = newWindow;

    App.views.fingerForest.drawFingerForest(newWindow);
  }

  return {
    setTimeWindow,
    timeWindowBrushUpdated
  }
}
