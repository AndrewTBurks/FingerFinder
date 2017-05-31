"use strict";

var App = App || {};

let SimulationDataModel = function() {
  let self = {
    currentTimestep: null,
    currentRun: null,
    currentData: null
  };

  function loadData(run, timestep) {
    return new Promise(function(resolve, reject) {
      // if this timestep is already loaded, instantly resolve with the currentData
      if (run === self.currentRun && timestep === self.currentTimestep) {
        resolve(self.currentData);
      }

      // convert run and timestep values into format of files
      let runName = "run" + ("0" + run).substr(-2);
      let timestepName = ("00" + timestep).substr(-3);

      // create filepath from all 3 pieces
      let filePath = ["/clean.44", runName, timestepName].join("/") + ".csv";


      console.time('File Load');
      // load the csv and reformat data
      d3.csv(filePath, function(err, data) {

        if (err) {
          reject(err);
        }

        self.currentRun = run;
        self.currentData = _.map(data, function(el) {
          return {
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
        });

        console.timeEnd('File Load');
        resolve(self.currentData);
      });
    });
  }

  function getData(run, timestep) {
    return loadData(run, timestep);
  }

  return {
    getData
  };
};
