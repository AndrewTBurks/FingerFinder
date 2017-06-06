"use strict";

var App = App || {};

let RunSummaryModel = function() {
  let self = {
    clusterCenters: null,
    runs: null,
    summaryData: null
  };

  init();

  function init() {
    self.summaryData = {};
    self.clusterCenters = {};
    self.runs = _.pull(d3.range(1, 21), 13, 15);

    console.log(self.clusterCenters);
  }

  function loadAllClusterCenters() {
    return new Promise(function(resolve, reject) {
      let loadQueue = d3.queue();
      console.log(self.runs);

      for (let run of self.runs) {

        let runName = "run" + ("0" + run).substr(-2);

        let filePath = ["/clean.44", runName].join("/") + "/allClusterCenters.json";
        console.log(filePath);

        loadQueue.defer(d3.json, filePath);
      }

      loadQueue.awaitAll(function(err, allData) {
        if (err) reject(err);

        console.log(allData);
        filesLoaded(allData, resolve)
      });

    })
  }

  function filesLoaded(runArr, resolve) {
    for(let runInd of Object.keys(runArr)) {
      let runName = "run" + ('0' + (self.runs[runInd])).substr(-2);
      self.clusterCenters[runName] = runArr[runInd];
    }

    resolve(self.clusterCenters);
  }

  function summarizeClusterData(clusterData) {
    // summarize this data before returning the summarized data

    return self.summaryData;
  }

  return {
    loadAllClusterCenters
  };
};
