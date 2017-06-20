"use strict";

var App = App || {};

let FingerForestView = function(div) {
  let self = {
    div: null,
    SVG: null,

    clusterData: null
  };

  init();

  function init() {
    self.div = d3.select(div);

    setupSVG();
  }

  function setupSVG() {
    // these will remain squares and will not fill space completely
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.SVG = self.div
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    // .attr("viewBox", [0, 0, width, height].join(" "));
  }

  function importClusterData(clusterData) {
    self.clusterData = clusterData;
  }

  function drawFingerForest(timeWindow) {
    console.log("Drawing finger forest for", timeWindow);

    self.currentTimeWindow = timeWindow;
    let runClusters = self.clusterData[("run" + ("0" + App.state.currentRun).substr(-2))];

    let uniqData = _.map(runClusters, t => {
      return _.keyBy(_.uniqBy(_.orderBy(t, 'size', "desc"), 'clusterID'), 'clusterID');
    });
    // let uniqData = _.keyBy(_.uniqBy(_.orderBy(runClusters[d], 'size', "desc"), 'clusterID'), 'clusterID');
    let otherData = _.map(runClusters, (t, i) => {
      return _.difference(t, Object.values(uniqData[i]));
    });

    _.forEach(otherData, (t, i) => {
      _.forEach(t, f => {
        uniqData[i][f.clusterID].size += f.size;
        uniqData[i][f.clusterID].concTotal += f.concTotal;
      });
    });

    let positionMap = calculateIDtoPositionMap(timeWindow);

    let numClusters = Object.keys(positionMap).length;

    let margins = {
      top: 15,
      left: 15,
      right: 15,
      bottom: 35
    };

    let width = +self.SVG.attr("width"),
      height = +self.SVG.attr("height");

    let y = self.yScale = d3.scaleLinear()
      .domain([0, numClusters - 1])
      .range([margins.top, height - margins.bottom]);

    let x = self.xScale = d3.scaleLinear()
      .domain(timeWindow)
      .range([margins.left, width - margins.right]);

    let nodeOffset = x(timeWindow[0] + 1) - x(timeWindow[0]);

    let nodeMargin = 2;

    let minNodeSize = 2;

    let maxNodeHeight = (height - ((numClusters - 1) * nodeMargin)) / (2 * numClusters);
    let maxNodeWidth = (width - ((timeWindow[1] - timeWindow[0]) * nodeMargin)) / (2 * (timeWindow[1] - timeWindow[0] + 1));

    console.log(maxNodeHeight, maxNodeWidth);

    let maxNodeSize = d3.min([maxNodeHeight, maxNodeWidth]); // just to test first

    let maxClusterSize = d3.max(
      d3.range(timeWindow[0], timeWindow[1] + 1),
      function(t) {
        return d3.max(Object.values(uniqData[t]), f => f.size);
      });

    let radiusScale = d3.scaleLinear()
      .domain([0, maxClusterSize])
      .range([minNodeSize, maxNodeSize]);

    let axis = d3.axisBottom(x)
      .tickValues(d3.range(timeWindow[0], timeWindow[1] + 1, 2));

    self.SVG.selectAll("*").remove();

    self.timestepHighlight = self.SVG.append("line");

    self.axisG = self.SVG.append("g")
      .attr("transform", "translate(" + 0 + ", " + (height - margins.bottom / 2) + ")")
      .call(axis);

    let linkG = self.SVG.append("g");
    let nodeG = self.SVG.append("g");

    self.timestepHighlight
      .attr("class", "timestepHighlight")
      .attr("transform", "translate(" + x(App.state.currentTimestep) + ", 0)")
      .attr("y1", margins.top - maxNodeSize)
      .attr("y2", height - margins.bottom + maxNodeSize)
      .attr("x1", 0)
      .attr("x2", 0)
      .style("stroke-width", maxNodeSize * 2 + 2);

    nodeG.selectAll(".timestepG")
      .data(d3.range(timeWindow[0], timeWindow[1] + 1))
      .enter().append("g")
      .attr("class", ".timestepG")
      .attr("transform", function(d) {
        return "translate(" + x(d) + ", 0)";
      })
      .each(function(d) {
        d3.select(this).selectAll(".finger")
          .data(Object.values(uniqData[d]))
          // .data(_.uniqBy(_.orderBy(runClusters[d], 'size', "desc"), 'clusterID'))
          .enter().append("circle")
          .attr("class", "finger")
          .attr("id", (f) => f.clusterID)
          .attr("r", (f) => radiusScale(f.size))
          .style("fill", (f) => {
            return App.views.flowLegend.getColorOf(f.concTotal / f.size);
          })
          .attr("transform", function(f) {
            let pos = positionMap[f.clusterID];
            let yCoord = y(pos);

            return "translate(0, " + yCoord + ")";
          });

      });

    linkG.selectAll(".timestepG")
      .data(d3.range(timeWindow[0], timeWindow[1]))
      .enter().append("g")
      .attr("class", ".timestepG")
      .attr("transform", function(d) {
        return "translate(" + x(d) + ", 0)";
      })
      .each(function(d) {
        d3.select(this).selectAll(".link")
          .data(runClusters[d].filter(f => f.nextClusterID != -1))
        .enter().append("path")
          .attr("class", "link")
          .each(function(f) {
            let line = d3.select(this);

            let posStart = positionMap[f.clusterID];
            let yStart = y(posStart);

            let posEnd = positionMap[f.nextClusterID];
            let yEnd = y(posEnd);

            let path = d3.path();
            path.moveTo(0, yStart);
            path.quadraticCurveTo(nodeOffset, yStart + (yEnd - yStart) / 4, nodeOffset, yEnd);

            line
              .attr("d", path)
              .style("stroke-width", radiusScale(f.size));
          })
          // .select(function() {
          //   return this.parentNode.appendChild(this.cloneNode(true));
          // })
          // .attr("class", "linkShadow")
          // .style("stroke-width", function() {
          //   return d3.select(this).style("stroke-width") + 2;
          // });
      });

  }

  function calculateIDtoPositionMap(timeWindow) {
    let runClusters = self.clusterData[("run" + ("0" + App.state.currentRun).substr(-2))];

    let fingerTimeRange = {};

    // for all timesteps, store all timesteps active of fingers
    for (let i = timeWindow[0]; i <= timeWindow[1]; i++) {
      for (let finger of runClusters[i]) {
        if (!fingerTimeRange[finger.clusterID]) {
          fingerTimeRange[finger.clusterID] = {
            children: [],
            timesteps: []
          };
        }

        fingerTimeRange[finger.clusterID].timesteps.push(i);
      }
    }

    // calculate extents
    for (let id of Object.keys(fingerTimeRange)) {
      fingerTimeRange[id].timeExtent = d3.extent(fingerTimeRange[id].timesteps);
    }

    // add connect fingers through children arrays (up before last timestep)
    // also check if a finger is a root
    for (let i = timeWindow[0]; i < timeWindow[1]; i++) {
      for (let finger of runClusters[i]) {
        // check if it is a root
        if (finger.nextClusterID == -1) {
          fingerTimeRange[finger.clusterID].disap = true;
        }

        // add finger to children of parent
        if (fingerTimeRange[finger.nextClusterID]) {
          fingerTimeRange[finger.nextClusterID].children.push(finger.clusterID)
        }
      }
    }

    for (let finger of runClusters[timeWindow[1]]) {
      fingerTimeRange[finger.clusterID].root = true;
    }

    // remove duplicate children and remove self from children (self will be inserted in the middle afterwards)
    for (let id of Object.keys(fingerTimeRange)) {
      fingerTimeRange[id].children = _.uniq(fingerTimeRange[id].children);
      fingerTimeRange[id].children = _.filter(fingerTimeRange[id].children, cID => cID != id);

      // sort by latest time active
      fingerTimeRange[id].children = _.orderBy(fingerTimeRange[id].children, (o) => fingerTimeRange[o].timeExtent[1], 'desc');
    }

    // define any roots of graph to be fingers which are in the last timestep or ones that dissipate
    let roots = _.filter(Object.keys(fingerTimeRange), id => fingerTimeRange[id].root || fingerTimeRange[id].disap);

    // get the full node ordering by expanding roots into children recursively
    let nodes;
    // try catch block to handle error of max call stack size
    try {
      nodes = _.map(roots, replaceWithChildrenInOrderRecursive);
    } catch (err) {
      alert(err);

      let map = {};
      for (let index in Object.keys(fingerTimeRange)) {
        map[Object.keys(fingerTimeRange)[index]] = index;
      }

      return map;
    }

    // flatten this as the arrays become nested
    let ordering = _.flattenDeep(nodes);
    let orderUniq = _.uniq(ordering);

    // convert the ordering to a dictionary -- clusterID => index
    let map = {};
    for (let index in orderUniq) {
      map[orderUniq[index]] = index;
    }

    return map;


    function replaceWithChildrenInOrderRecursive(id) {
      if (fingerTimeRange[id].inOrderChildren) {
        return fingerTimeRange[id].inOrderChildren;
      }

      if (fingerTimeRange[id].children.length === 0) {
        return +id;
      }

      let partition = [
        _.filter(fingerTimeRange[id].children, (o, i) => i % 2 === 0),
        _.filter(fingerTimeRange[id].children, (o, i) => i % 2 !== 0)
      ];

      let prependChildren = _.map(partition[0], replaceWithChildrenInOrderRecursive);
      let appendChildren = _.map(_.reverse(partition[1]), replaceWithChildrenInOrderRecursive);

      fingerTimeRange[id].inOrderChildren = _.concat(prependChildren, +id, appendChildren);

      return fingerTimeRange[id].inOrderChildren;
    }
  }

  function updateSelectedRun(run) {
    drawFingerForest(self.currentTimeWindow);
  }

  function updateSelectedTimestep(time) {
    self.timestepHighlight
      .attr("transform", "translate(" + self.xScale(App.state.currentTimestep) + ", 0)");
  }

  function updateColorScale(scale) {
    self.SVG.selectAll(".finger")
      .style("fill", (f) => {
        return App.views.flowLegend.getColorOf(f.concTotal / f.size);
      });
  }

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.SVG
      .attr("width", width)
      .attr("height", height);
  }

  return {
    importClusterData,
    drawFingerForest,
    updateSelectedRun,
    updateSelectedTimestep,
    updateColorScale,

    resize
  };
};
