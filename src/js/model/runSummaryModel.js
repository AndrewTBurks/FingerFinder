"use strict";

var App = App || {};

let RunSummaryModel = function() {
  let self = {
    runs: null,
    singleProperties: null,
    averagedProperties: null,

    clusterCenters: null,
    summaryData: null,

    summaryExtents: null
  };

  init();

  function init() {
    self.runs = _.pull(d3.range(1, 7), 13, 15);

    // set the single and averages properties as global variables
    App.singleProperties = [
      "totalClusters"
    ];

    App.averagedProperties = [
      "numClusters",
      "mergeFactor",
      "dissipationFactor",
      "avgFingerConc",
      "avgFingerPointConc",
      "avgFingerVelMag",
      // "avgFingerVelMagConc",
      "avgFingerConcDensity",
      // "avgFingerPointDensity"
    ];

    App.summaryPropertyToText = {
      "totalClusters": {
        name: "Total Fingers",
        abbr: "Total Fingers",
        desc: "The total number of unique fingers in a run."
      },
      "numClusters": {
        name: "Fingers per Timestep",
        abbr: "Finger/Time",
        desc: "The number of fingers in each timestep."
      },
      "mergeFactor": {
        name: "Merge Factor",
        abbr: "Merge Factor",
        desc: "The percent of fingers that merge into another in each timestep."
      },
      "dissipationFactor": {
        name: "Dissipation Factor",
        abbr: "Diss. Factor",
        desc: "The percent of fingers that disappear in each timestep."
      },
      "avgFingerConc": {
        name: "Average Finger Concentration",
        abbr: "Avg. Finger Conc.",
        desc: "The average total concentration of fingers in a timestep."
      },
      "avgFingerPointConc": {
        name: "Average Finger Point Concentration",
        abbr: "μ Finger Pt. Conc.",
        desc: "The average concentration of points in fingers in a timestep."
      },
      "avgFingerVelMag": {
        name: "Average Finger |Velocity|",
        abbr: "μ Finger |Vel.|",
        desc: "The average magnitude of velocity of fingers in a timestep."
      },
      "avgFingerVelMagConc": {
        name: "Average Finger |Velocity| by Concentration",
        abbr: "μ Finger |Vel.| by Conc.",
        desc: "The average magnitude of velocity of fingers in a timestep, weighted by total concentration."
      },
      "avgFingerConcDensity": {
        name: "Average Finger Concentration Density",
        abbr: "μ Finger Conc. Dens.",
        desc: "The average concentration density of fingers, by total concentration over the bounding box volume."
      },
      "avgFingerPointDensity": {
        name: "Average Finger Point Density",
        abbr: "μ Finger Pt. Dens.",
        desc: "The average point density of fingers, by the # points over the bounding box volume."
      }
    };
  }

  function loadAllClusterCenters() {
    return new Promise(function(resolve, reject) {
      if (self.clusterCenters) {
        resolve(self.clusterCenters);
      }

      self.clusterCenters = {};

      let loadQueue = d3.queue();

      for (let run of self.runs) {

        let runName = "run" + ("0" + run).substr(-2);

        let filePath = ["./clean.44", runName].join("/") + "/allClusterCenters.json";

        loadQueue.defer(d3.json, filePath);
      }

      loadQueue.awaitAll(function(err, allData) {
        if (err) reject(err);

        filesLoaded(allData, resolve)
      });

    });
  }

  function filesLoaded(runArr, resolve) {
    for (let runInd of Object.keys(runArr)) {
      let runName = "run" + ('0' + (self.runs[runInd])).substr(-2);
      self.clusterCenters[runName] = runArr[runInd];
    }

    resolve(self.clusterCenters);
  }

  function summarizeClusterData(clusterData) {
    // summarize this data before returning the summarized data
    if (self.summaryData && self.summaryExtents) {
      return {
        runs: self.summaryData,
        extents: self.summaryExtents
      };
    }

    self.summaryData = {};
    self.summaryExtents = {};

    for (let runNum of self.runs) {
      let runName = "run" + ('0' + (runNum)).substr(-2);
      self.summaryData[runName] = computeRunSummary(self.clusterCenters[runName]);
    }

    let runArray = Object.values(self.summaryData);

    for (let property of App.singleProperties) {
      self.summaryExtents[property] = d3.extent(runArray, e => e[property]);
    }

    for (let property of App.averagedProperties) {
      self.summaryExtents[property] = {
        avg: d3.extent(runArray, e => e[property].avg),
        ext: d3.extent(_.flatten(_.map(runArray, e => e[property].ext)))
      };
    }

    return {
      runs: self.summaryData,
      extents: self.summaryExtents
    };
  }

  function computeRunSummary(runData) {
    // compute arrays of statistics for each timestep in the run
    let timestepDataStats = _.map(runData, getTimestepStats)

    // take the mean and extent of each property over the course of the run
    return {
      totalClusters: d3.max(runData, timestep => d3.max(timestep, cluster => cluster.clusterID)),
      clustersPerTime: _.map(timestepDataStats, t => t.numClusters),
      numClusters: {
        avg: d3.mean(timestepDataStats, t => t.numClusters),
        ext: d3.extent(timestepDataStats, t => t.numClusters)
      },
      mergeFactor: {
        avg: d3.mean(timestepDataStats, t => t.mergeFactor),
        ext: d3.extent(timestepDataStats, t => t.mergeFactor)
      },
      dissipationFactor: {
        avg: d3.mean(timestepDataStats, t => t.dissipationFactor),
        ext: d3.extent(timestepDataStats, t => t.dissipationFactor)
      },
      avgFingerConc: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerConc),
        ext: d3.extent(timestepDataStats, t => t.avgFingerConc)
      },
      avgFingerPointConc: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerPointConc),
        ext: d3.extent(timestepDataStats, t => t.avgFingerPointConc),
      },
      avgFingerVelMag: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerVelMag),
        ext: d3.extent(timestepDataStats, t => t.avgFingerVelMag),
      },
      avgFingerVelMagConc: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerVelMagConc),
        ext: d3.extent(timestepDataStats, t => t.avgFingerVelMagConc),
      },
      avgFingerConcDensity: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerConcDensity),
        ext: d3.extent(timestepDataStats, t => t.avgFingerConcDensity),
      },
      avgFingerPointDensity: {
        avg: d3.mean(timestepDataStats, t => t.avgFingerPointDensity),
        ext: d3.extent(timestepDataStats, t => t.avgFingerPointDensity),
      }
    };
  }

  function getTimestepStats(timestepData) {
    if (timestepData.length === 0) {
      return {
        numClusters: timestepData.length,
        avgFingerConc: undefined,
        avgFingerPointConc: undefined,
        avgFingerVelMag: undefined,
        avgFingerVelMagConc: undefined,
        avgFingerPointDensity: undefined,
        avgFingerConcDensity: undefined,
        mergeFactor: undefined
      };
    }

    // numClusters: simply the number of clusters in a timestep
    // avgFingerConc: average total concentration of fingers in the timestep
    // avgFingerPointConc: average per-point concentration of fingers in the timestep
    // avgFingerVelMag: average velocity of clusters in the timestep
    // avgFingerVelMagConc: average velocity of clusters in the timestep, concentration weighted
    // avgFingerPointDensity: average point density of the fingers in the timestep (number of points per bounding volume)
    // avgFingerConcDensity: average concentration density of the fingers in the timestep (total concentration per bounding volume)
    // mergeFactor: number of fingers which change ID from this timestep to the next (without disappearing)
    // dissipationFactor: number of fingers which dissapear (next ID of -1)

    let timestepSummary = {
      numClusters: timestepData.length,
      avgFingerConc: d3.mean(timestepData, cluster => cluster.concTotal),
      avgFingerPointConc: d3.mean(timestepData, cluster => cluster.concTotal / cluster.size),
      avgFingerVelMag: d3.mean(timestepData, cluster => getVectorMagnitude({
        x: cluster.vx,
        y: cluster.vy,
        z: cluster.vz
      })),
      avgFingerVelMagConc: d3.mean(timestepData, cluster => cluster.concTotal * getVectorMagnitude({
        x: cluster.vx,
        y: cluster.vy,
        z: cluster.vz
      })) / d3.sum(timestepData, cluster => cluster.concTotal),
      avgFingerPointDensity: d3.mean(timestepData, cluster => cluster.size / getClusterVolume(cluster)),
      avgFingerConcDensity: d3.mean(timestepData, cluster => cluster.concTotal / getClusterVolume(cluster)),
      mergeFactor: _.filter(timestepData, cluster => cluster.nextClusterID !== -1 && cluster.nextClusterID !== cluster.clusterID).length /
        timestepData.length,
      dissipationFactor: _.filter(timestepData, cluster => cluster.nextClusterID === -1).length / timestepData.length
    };

    return timestepSummary;
  }

  function getVectorMagnitude(vec) {
    return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
  }

  function getClusterVolume(cluster) {
    return (cluster.xMax - cluster.xMin) * (cluster.yMax - cluster.yMin) * (cluster.zMax - cluster.zMin);
  }

  function getClusterCenters() {
    return loadAllClusterCenters();
  }

  function getClusterSummary(data) {
    return summarizeClusterData(data);
  }

  function getSingleProperties() {
    return self.singleProperties;
  }

  function getAveragedProperties() {
    return self.averagedProperties;
  }

  return {
    loadAllClusterCenters,
    getClusterCenters,
    getClusterSummary,

    getSingleProperties,
    getAveragedProperties
  };
};
