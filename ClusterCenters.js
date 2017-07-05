let fs = require('fs');
let _ = require('lodash');

var folderPath = "clean.44/run20/";

var data = [];
var dataLength;

var clusters = new Array(121).fill([]); // clusters of each timestep
var clusterCenters = new Array(121).fill([]); // data for clusters in each timestep

var distanceTolerance = 1;
var edgeTolerance = 0;

var mean, stddev, maxConc;

var start = 0;
var end = 120;
// var end = 106;


// using all clusters file
fs.readFile(folderPath + "allClusters.json", (err, json) => {
  clusters = JSON.parse(json.toString());
  readFileNumCSV(start);
});

function clusterTimeline() {
  var prevCluster;
  var closestDistance;

  var thisPoint;
  var thisCluster;
  var otherPoint;
  var otherCluster;

  var thisDistance;
  var thisWeight;

  var maxIDUsed = clusterCenters[start].length - 1; // one ID for each cluster in start

  // assign clusterID
  for (var i = start + 1; i <= end; i++) {
    // for each timestep aside from the start

    for (var j = 0; j < clusterCenters[i].length; j++) {
      // for each cluster in this timestep
      thisCluster = clusterCenters[i][j];


      // thisPoint = new THREE.Vector3(thisCluster.cx - (thisCluster.vx / 2),
      //   thisCluster.cy - (thisCluster.vy / 2),
      //   thisCluster.cz - (thisCluster.vz / 2));


      thisPoint = {
        x: thisCluster.cx - (thisCluster.vx / 2),
        y: thisCluster.cy - (thisCluster.vy / 2),
        z: thisCluster.cz - (thisCluster.vz / 2)
      };

      // set distanceTolerance based on the max of the extent dimensions/2


      closestCluster = -1;
      closestDistance = 20;
      // find the closest cluster in the previous timestep
      for (var k = 0; k < clusterCenters[i - 1].length; k++) {
        // for each cluster in the previous timestep
        otherCluster = clusterCenters[i - 1][k];
        distanceTolerance = _.max([thisCluster.xMax - thisCluster.xMin, thisCluster.yMax - thisCluster.ymin, thisCluster.zMax - thisCluster.zMin]);


        // otherPoint = new THREE.Vector3(otherCluster.cx + (otherCluster.vx / 2),
        //   otherCluster.cy + (otherCluster.vy / 2),
        //   otherCluster.cz + (otherCluster.vz / 2));

        otherPoint = {
          x: otherCluster.cx + (otherCluster.vx / 2),
          y: otherCluster.cy + (otherCluster.vy / 2),
          z: otherCluster.cz + (otherCluster.vz / 2)
        };

        // linear distance between points
        // thisDistance = thisPoint.distanceTo(otherPoint);
        thisDistance = pointDistance(thisPoint, otherPoint);

        // if the distance between clusters is smaller than the closest so far
        // if((thisDistance < closestDistance) && (thisDistance < distanceTolerance)) {
        if ((thisDistance < closestDistance) &&
          (thisDistance < distanceTolerance)) {
          // set as the new closest cluster
          closestCluster = clusterCenters[i - 1][k].clusterID;
          closestDistance = thisDistance;
        }

      } // END for(var k = 0; ...

      //if(closestCluster === -1 || closestDistance > distanceTolerance) {
      if (closestCluster === -1) {
        // if no close previous cluster was found
        clusterCenters[i][j].clusterID = ++maxIDUsed;
      } else {
        clusterCenters[i][j].clusterID = closestCluster;
      }

    } // END for(var j = 0...

  } // END for(var i = 0...


  /* === clusterID adaptation === */
  // // assign clusterID
  // for(var i = start; i < end; i++) {
  //   // for each timestep aside from the start
  //
  //   for(var j = 0; j < clusterCenters[i].length; j++)
  //   {
  //     // for each cluster in this timestep
  //     thisCluster = clusterCenters[i][j];
  //
  //
  //     thisPoint = new THREE.Vector3(thisCluster.cx+(thisCluster.vx/2),
  //                                   thisCluster.cy+(thisCluster.vy/2),
  //                                   thisCluster.cz+(thisCluster.vz/2));
  //
  //     // set distanceTolerance based on the max of the extent dimensions/2
  //
  //
  //     closestCluster = -1;
  //     closestDistance = 20;
  //     // find the closest cluster in the previous timestep
  //     for(var k = 0; k < clusterCenters[i+1].length; k++)
  //     {
  //       // for each cluster in the previous timestep
  //       otherCluster = clusterCenters[i+1][k];
  //       distanceTolerance = d3.max([otherCluster.xMax-otherCluster.xMin, otherCluster.yMax-otherCluster.ymin, otherCluster.zMax-otherCluster.zMin])/2;
  //
  //
  //       otherPoint = new THREE.Vector3(otherCluster.cx-(otherCluster.vx/2),
  //                                     otherCluster.cy-(otherCluster.vy/2),
  //                                     otherCluster.cz-(otherCluster.vz/2));
  //       // linear distance between points
  //       thisDistance = thisPoint.distanceTo(otherPoint);
  //
  //
  //       // if the distance between clusters is smaller than the closest so far
  //       // if((thisDistance < closestDistance) && (thisDistance < distanceTolerance)) {
  //       if((thisDistance < closestDistance)){
  //         // set as the new closest cluster
  //         closestCluster = clusterCenters[i+1][k].clusterID;
  //         closestDistance = thisDistance;
  //       }
  //
  //     } // END for(var k = 0; ...
  //
  //     clusterCenters[i][j].nextID = closestCluster;
  //
  //
  //   } // END for(var j = 0...
  //
  // } // END for(var i = 0...

  /* === OLD NEXT CLUSTER CODE === */
  // use some metric to assign a weight to each cluster in timestep i+1
  // both distance and difference in concentration
  var maxWeight;

  // assign nextClusterID
  for (var i = start; i < end; i++) {
    // for each timestep aside from the start

    for (var j = 0; j < clusterCenters[i].length; j++) {
      // for each cluster in this timestep
      thisCluster = clusterCenters[i][j];


      // thisPoint = new THREE.Vector3(thisCluster.cx + (thisCluster.vx / 2),
      //   thisCluster.cy + (thisCluster.vy / 2),
      //   thisCluster.cz + (thisCluster.vz / 2));

      thisPoint = {
        x: thisCluster.cx + (thisCluster.vx / 2),
        y: thisCluster.cy + (thisCluster.vy / 2),
        z: thisCluster.cz + (thisCluster.vz / 2)
      };

      // set distanceTolerance based on the max of the extent dimensions/2


      closestCluster = -1;
      maxWeight = 0;

      // find the closest cluster in the previous timestep
      for (var k = 0; k < clusterCenters[i + 1].length; k++) {
        // for each cluster in the previous timestep
        otherCluster = clusterCenters[i + 1][k];
        distanceTolerance = _.max([otherCluster.xMax - otherCluster.xMin, otherCluster.yMax - otherCluster.ymin, otherCluster.zMax - otherCluster.zMin]) / 2;


        otherPoint = {
          x: otherCluster.cx - (otherCluster.vx / 2),
          y: otherCluster.cy - (otherCluster.vy / 2),
          z: otherCluster.cz - (otherCluster.vz / 2)
        };

        // linear distance between points
        // thisDistance = thisPoint.distanceTo(otherPoint);
        thisDistance = pointDistance(thisPoint, otherPoint);

        // using weights and then finding max
        thisWeight = 0;
        // thisWeight += thisDistance < distanceTolerance ? distanceTolerance / thisDistance : 0;
        thisWeight += 1 + (thisDistance * -1 / distanceTolerance);
        thisWeight += thisCluster.concTotal < otherCluster.concTotal ? 0.1 : 0;
        thisWeight += thisCluster.clusterID === otherCluster.clusterID ? 0.5 : 0;

        if (thisWeight > maxWeight) {
          maxWeight = thisWeight;
          closestCluster = otherCluster.clusterID;
          // closestCluster = k;
        }


      } // END for(var k = 0; ...

      // assign nextClusterID

      // nextClusterID = -1 if no next cluster, or a valid ID if there is a next
      clusterCenters[i][j].nextClusterID = closestCluster;

    } // END for(var j = 0...

  } // END for(var i = start...

  console.log(maxIDUsed);
  downloadJSON(clusterCenters);
} // END clusterTimeline() { ...

function pointDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function findCenterOfConc(n) {
  var numClusters = clusters[n].length;
  clusterCenters[n] = new Array(numClusters);

  var clusterSize;
  var xTot, yTot, zTot, concTot;
  var xVelTot, yVelTot, zVelTot;
  var magVelTot, magVelConcTot;
  var xMax, xMin, yMax, yMin, zMax, zMin;
  var thisConc;

  // console.log(data.length);

  for (var i = 0; i < numClusters; i++) {
    // for each cluster in file n
    clusterSize = clusters[n][i].length;

    // get center of conc
    xTot = 0;
    yTot = 0;
    zTot = 0;
    concTot = 0;

    // get center of conc avg vel
    xVelTot = 0;
    yVelTot = 0;
    zVelTot = 0;

    // get avg magnitude of velocity
    magVelTot = 0;
    magVelConcTot = 0;

    // extents of the cluster
    xMax = -100;
    xMin = 100;
    yMax = -100;
    yMin = 100;
    zMax = -100;
    zMin = 100;

    for (var j = 0; j < clusterSize; j++) {
      // for each point in cluster i

      var point = data[clusters[n][i][j]];

      // add x, y, z weighted by conc of point
      thisConc = point.concentration;

      xTot += point.Points0 * thisConc;
      yTot += point.Points1 * thisConc;
      zTot += point.Points2 * thisConc;
      concTot += thisConc;

      xVelTot += point.velocity0 * thisConc;
      yVelTot += point.velocity1 * thisConc;
      zVelTot += point.velocity2 * thisConc;

      var thisVelMag = Math.sqrt(Math.pow(point.velocity0, 2) + Math.pow(point.velocity1, 2) + Math.pow(point.velocity2, 2));

      magVelTot += thisVelMag;
      magVelConcTot += thisVelMag * thisConc;

      // calculating extents of cluster
      if (point.Points0 < xMin) {
        xMin = point.Points0;
      }
      if (point.Points0 > xMax) {
        xMax = point.Points0;
      }
      if (point.Points1 < yMin) {
        yMin = point.Points1;
      }
      if (point.Points1 > yMax) {
        yMax = point.Points1;
      }
      if (point.Points2 < zMin) {
        zMin = point.Points2;
      }
      if (point.Points2 > zMax) {
        zMax = point.Points2;
      }
      // find average velocity of points in
    }


    clusterCenters[n][i] = {
      size: clusterSize,
      concTotal: concTot,
      clusterID: i,
      nextClusterID: -1,
      cx: xTot / concTot,
      cy: yTot / concTot,
      cz: zTot / concTot,
      vx: xVelTot / concTot,
      vy: yVelTot / concTot,
      vz: zVelTot / concTot,
      vMag: magVelTot / clusterSize,
      vMagConc: magVelConcTot / concTot,
      xMax: xMax,
      xMin: xMin,
      yMax: yMax,
      yMin: yMin,
      zMax: zMax,
      zMin: zMin
    };
  }

  console.log("Centers Found:", n);

  if (n < end) {
    readFileNumCSV(n + 1);
  } else {
    clusterTimeline();
  }
}

function readFileNumCSV(n) {
  data = [];

  fs.readFile(folderPath + ('000' + n).substr(-3) + ".csv", (err, points) => {
    let rows = points.toString().split("\n");

    let headers = rows[0].replace(/['"]+/g, '').split(",");
    let rowData = rows.slice(1);

    data = _.map(rowData, point => {
      let pt = {
        adjPoints: [],
        inCluster: -1
      };

      _.forEach(point.split(","), (o, i) => {
        pt[headers[i]] = parseFloat(o);
      });

      return pt;
    });

    console.log(n, "read (CSV).");

    findCenterOfConc(n);
  });
}

function rangesWithinThreshold(aMin, aMax, bMin, bMax, tolerance) {
  // range A inside range B
  if ((aMin < bMax) && (aMin > bMin) && (aMax < bMax) && (aMax > bMin)) {
    return true;
  }
  // either bMax or bMin are within range A
  else if (((bMin < aMax) && (bMin > aMin)) || ((bMax < aMax) && (bMax > aMin))) {
    return true;
  }
  // if bMax is within tolerance of aMin or if bMin is within tolerance of aMax
  else if ((+(aMin - bMax) < tolerance) || (+(bMin - aMax) < tolerance)) {
    return true;
  } else {
    return false;
  }
}


function downloadJSON(object) {
  var json = JSON.stringify(object)

  fs.writeFileSync(folderPath + "allClusterCenters.json", json);
}
