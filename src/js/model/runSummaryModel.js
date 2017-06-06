"use strict";

var App = App || {};

let RunSummaryModel = function() {
  let self = {
    runs: null,
    clusterCenters: null,
    summaryData: null
  };

  init();

  function init() {
    self.runs = _.pull(d3.range(1, 21), 13, 15);

    console.log(self.clusterCenters);
  }

  function loadAllClusterCenters() {
    return new Promise(function(resolve, reject) {
      if (self.clusterCenters) {
        resolve(self.clusterCenters);
      }

      self.clusterCenters = {};

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

    });
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
    if (self.summaryData) {
      return self.summaryData;
    }

    self.summaryData = {};

    for(let runNum of self.runs) {
      let runName = "run" + ('0' + (runNum)).substr(-2);
      console.log("Computing Summary of:", runName);

      self.summaryData[runName] = computeRunSummary(self.clusterCenters[runName]);
    }

    return self.summaryData;
  }

  function computeRunSummary(runData) {
    // console.log(runData);

    // var timestepMergeFactors = new Array(120).fill(0);
    // var timestepNumClusters = new Array(120).fill(0);
    // var timestepAvgFingerConc = new Array(120).fill(0);
    // var timestepAvgPointConc = new Array(120).fill(0);
    // var timestepAvgFingerVelMag = new Array(120).fill(0);
    // var timestepAvgFingerVelMagConc = new Array(120).fill(0);
    // var timestepAvgFingerDensity = new Array(120).fill(0);

    let timestepDataStats = _.map(runData, getTimestepStats)

    // {
    //   run: runNum,
    //   totalClusters: numClusters,
    //   avgClusters: d3.mean(timestepNumClusters),
    //   mergeFactor: d3.mean(timestepMergeFactors),
    //   avgFingerConc: d3.mean(timestepAvgFingerConc),
    //   avgFingerPointConc: d3.mean(timestepAvgPointConc),
    //   avgFingerDensity: d3.mean(timestepAvgFingerDensity),
    //   avgFingerVelMag: d3.mean(timestepAvgFingerVelMag),
    //   extAvgFingerVelMag: d3.extent(timestepAvgFingerVelMag),
    //   extFingerVelMag: [d3.min(thisClusterCenters, function(d) { return d3.min(d, function(e) {return e.vMag; }); }),
    //               d3.max(thisClusterCenters, function(d) { return d3.max(d, function(e) {return e.vMag; }); })],
    //   avgFingerVelMagConc: d3.mean(timestepAvgFingerVelMagConc),
    //   extAvgFingerVelMagConc: d3.extent(timestepAvgFingerVelMagConc),
    //   extFingerVelMagConc: [d3.min(thisClusterCenters, function(d) { return d3.min(d, function(e) {return e.vMagConc; }); }),
    //               d3.max(thisClusterCenters, function(d) { return d3.max(d, function(e) {return e.vMagConc; }); })],
    // }

    return {
      totalClusters: d3.max(runData, timestep => d3.max(timestep, cluster => cluster.clusterID)),
      clustersPerTime: timestepDataStats.numClusters,
      numClusters: {
        avg: d3.mean(timestepDataStats, t => t.numClusters),
        ext: d3.extent(timestepDataStats, t => t.numClusters)
      },
      mergeFactor: {
        avg: d3.mean(timestepDataStats, t => t.mergeFactor),
        ext: d3.extent(timestepDataStats, t => t.mergeFactor)
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
        avgFingerConc: 0,
        avgFingerPointConc: 0,
        avgFingerVelMag: 0,
        avgFingerVelMagConc: 0,
        avgFingerPointDensity: 0,
        avgFingerConcDensity: 0,
        mergeFactor: 0
      };
    }

    // explain more later
    let timestepSummary = {
      numClusters: timestepData.length,
      avgFingerConc: d3.mean(timestepData, cluster => cluster.concTotal),
      avgFingerPointConc: d3.mean(timestepData, cluster => cluster.concTotal/cluster.size),
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
        timestepData.length
    };

    console.log(timestepSummary);

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

  function getClusterSummary() {
    return loadAllClusterCenters()
      .then(summarizeClusterData);
  }

  return {
    loadAllClusterCenters,
    getClusterCenters,
    getClusterSummary
  };
};
