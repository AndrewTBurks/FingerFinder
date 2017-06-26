"use strict";

var App = App || {};

let SimulationDataModel = function() {
  let self = {
    currentTimestep: null,
    currentRun: null,

    currentData: null,
    currentClusters: null,

    mean: null,
    stdDev: null,
    extent: null,

    timestepReq: null,
    clusterReq: null
  };

  function loadData(run, timestep) {
    if (self.timestepReq) { self.timestepReq.abort(); }

    return new Promise(function(resolve, reject) {
      // if this timestep is already loaded, instantly resolve with the currentData
      if (run === self.currentRun && timestep === self.currentTimestep) {
        resolve(self.currentData);
      }

      // convert run and timestep values into format of files
      let runName = "run" + ("0" + run).substr(-2);
      let timestepName = ("00" + timestep).substr(-3);

      // create filepath from all 3 pieces
      let filePath = ["./clean.44", runName, timestepName].join("/") + ".csv";


      // console.time('File Load');
      // load the csv and reformat data
      self.timestepReq = d3.csv(filePath, function(err, data) {

        if (err) {
          reject(err);
        }

        self.currentRun = run;
        self.currentData = _.keyBy(_.map(data, function(el, i) {
          return {
            id: i,
            conc: parseFloat(el.concentration),
            pos: {
              x: parseFloat(el.Points0),
              y: parseFloat(el.Points2),
              z: parseFloat(el.Points1)
            },
            vel: {
              x: parseFloat(el.velocity0),
              y: parseFloat(el.velocity2),
              z: parseFloat(el.velocity1)
            }
          };
        }), 'id');

        self.extent = d3.extent(Object.values(self.currentData), function (e) { return e.conc; });
        self.mean = d3.mean(Object.values(self.currentData), function (e) { return e.conc; });
    		self.stdDev = d3.deviation(Object.values(self.currentData), function (e) { return e.conc; });

        // console.timeEnd('File Load');

        self.timestepReq = null;
        resolve(self.currentData);
      });
    });
  }

  function loadClusterData(run) {
    if (self.clusterReq) { self.clusterReq.abort(); }

    return new Promise(function(resolve, reject) {
      // if this run is already loaded, instantly resolve with the currentClusters
      if (run === self.currentRun) {
        resolve(self.currentClusters);
      }

      // convert run and timestep values into format of files
      let runName = "run" + ("0" + run).substr(-2);

      // create filepath from all 3 pieces
      let filePath = ["./clean.44", runName].join("/") + "/allClusters.json";

      // console.time('File Load');
      // load the csv and reformat data
      self.clusterReq = d3.json(filePath, function(err, data) {

        if (err) {
          reject(err);
        }

        self.currentRun = run;
        self.currentClusters = data;

        // console.timeEnd('File Load');

        self.clusterReq = null;
        resolve(self.currentClusters);
      });
    });
  }

  function getData(run, timestep) {
    document.body.style.cursor = "wait";

    return Promise.all([
      loadData(run, timestep),
      loadClusterData(run)
    ])
    .then(function(data) {
      document.body.style.cursor = "default";
      return data;
    });
  }

  function getStats() {
    return {
      extent: self.extent,
      mean: self.mean,
      stdDev: self.stdDev
    };
  }

  return {
    getData,
    getStats
  };
};
