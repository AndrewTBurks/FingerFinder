#include <cstdio>
#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <string>

using namespace std;

typedef struct PointStruct {
	float x;
	float y;
	float z;

	float conc;

	vector<int> adj;

	int inCluster;

} POINT;


vector<POINT*> fileData;
int dataLength;

vector<vector<int>> clusters;
vector<vector<int>> keptClusters;

int currentFile = 0;
int endFile = 10;

float maxDistance = .15;
float topThickness = .5;
float minClusterConc;

float mean;
float stddev;

void createClusters();

void joinClusters(int indA, int indB);
void filterSortClusters(int sizeThreshold);
void findAdjPoints();

void readFileNumCSV(int num);
void writeFileNumJSON(int num);

int getIndexOfConc(int val);
int findLargestNotInTopOrUsed();
bool canAddPointToCluster(int ind); 
void clearClusters();


int main() {
	fileData = vector<POINT*>();
	dataLength = 0;

	clusters = vector<vector<int>>();
	keptClusters = vector<vector<int>>();

	for (int i = 0; i < 121; i++) {
		keptClusters.push_back(vector<int>());
	}
	
	currentFile = 0;
	endFile = 0;

	maxDistance = .15;
	topThickness = .5;
	minClusterConc = 0;

	mean = 0;
	stddev = 0;	

	for (int i = 0; i <= endFile; i++) {
		currentFile = i;

		readFileNumCSV(i);
		cout << "Data Length: " << fileData.size() << endl;
		findAdjPoints();
		createClusters();
		filterSortClusters(50);
		writeFileNumJSON(i);
	}

}

// build clusters (fingers) from graph of nodes
void createClusters() {
	bool done = false;

	clusters.push_back(vector<int>());

	int ind = findLargestNotInTopOrUsed();
	int cNum = 0;

	if (ind > -1) {
		fileData[ind]->inCluster = cNum;
		clusters[cNum].push_back(ind);
	}
	else {
		done = true;
	}


	vector<int> cluster;    // current cluster
	int clusterNode;// current node in current cluster
	vector<int> adjNodes;   // nodes adj to current node in current cluster

	bool nodeAdded;
	int firstCluster;
	bool nodeFoundTwice;

	while (!done) {
		// find new point to add to clusters
		nodeAdded = false;
		firstCluster = -1;
		// node found in second cluster
		nodeFoundTwice = false;


		ind = findLargestNotInTopOrUsed();

		if (ind == -1) {
			done = true;
		}
		else {
			// for all clusters
			for (unsigned int i = 0; i < clusters.size(); i++) {
				// current cluster
				cluster = clusters[i];
				nodeFoundTwice = false;

				// for all nodes in each cluster
				for (int j = 0; j < cluster.size(); j++) {
					// current node in cluster
					clusterNode = cluster[j];
					// points adjacent to current node
					adjNodes = fileData[cluster[j]]->adj;

					// for all points adjacent to this node
					for (int k = 0; k < adjNodes.size(); k++) {
						//
						if (adjNodes[k] == ind) { // if it is found in this cluster
							if (!nodeAdded) { // if it hasn't been added yet
											  // add to the cluster
								nodeAdded = true;
								firstCluster = i;

								fileData[ind]->inCluster = i;
								cluster.push_back(ind);

								//console.log("Added", ind, "to Cluster", i);
							} // END if(!nodeAdded
							else {
								// node was found in multiple clusters
								nodeFoundTwice = true;
							} // END else ...

						} // END if(adjNodes[k] ...

					} // END for(var k =...

				} // END for(var j = ...

				  // if it was found 2 times and it is not the same cluster
				if (nodeFoundTwice && (firstCluster !=  i)) {
					joinClusters(firstCluster, i);
				}

			} // END for(var i = ...

			if (!nodeAdded) {
				// create new cluster to add node to
				int newClusterInd = clusters.size();
				clusters.push_back(vector<int>());
				// add this node to the new cluster
				fileData[ind]->inCluster = newClusterInd;
				clusters[newClusterInd].push_back(ind);

				//console.log("Added", ind, "to NEW Cluster", newClusterInd);
			} // END if(!nodeAdded ...

		} // END else ...

	} // END while(!done ...

	cout << "Done Grouping Points" << endl;
}

void joinClusters(int indA, int indB) {
	int bSize = clusters[indB].size();
	for (int i = 0; i < bSize; i++) {
		// add value to first cluster
		clusters[indA].push_back(clusters[indB][i]);
		// set the datas value to indicate it is in the first cluster from second
		fileData[clusters[indB][i]]->inCluster = indA;
	}
	// remove the data of the second cluster
	clusters[indB].erase(clusters[indB].begin(), clusters[indB].end());

	// console.log("Joined Clusters", indA, "and", indB);
}

void filterSortClusters(int sizeThreshold) {
	// clear this vector before pushing elements to it again
	keptClusters.erase(keptClusters.begin(), keptClusters.end());;
	for (int i = 0; i < clusters.size(); i++) {
		if (clusters[i].size() >= sizeThreshold) {
			keptClusters.push_back(clusters[i]);
		}
	}

	sort(keptClusters.begin(), keptClusters.end(), [](auto v1, auto v2) {
		return v2.size() > v1.size();
	});

	cout << "Done Getting Kept Clusters: " << currentFile << endl;
}

void findAdjPoints() {

	float thisX, thisY, thisZ;
	float dx, dy, dz;

	float pointDistance = 0;
	int consoleDisplayThreshold = 5000;

	for (int i = 0; i < dataLength; i++) {
		thisX = fileData[i]->x;
		thisY = fileData[i]->y;
		thisZ = fileData[i]->z;
		if (i >= consoleDisplayThreshold) {
			cout << "Adj Found for: " <<  consoleDisplayThreshold << endl;
			consoleDisplayThreshold += 5000;
		}
		for (int j = 0; j < dataLength; j++) {

			dx = fileData[j]->x - thisX;
			dy = fileData[j]->y - thisY;
			dz = fileData[j]->z - thisZ;

			pointDistance = sqrt(pow(dx, 2) + pow(dy, 2) + pow(dz, 2));

			if ((pointDistance < maxDistance) && (i != j)) {
				fileData[i]->adj.push_back(j);
			}
		}
	}

	cout << "Done Finding ADJ Points" << endl;
	//console.log("Max Neighbors", d3.max(data, function(e) { return e.adjPoints.length; }));
}

void readFileNumCSV(int n) {
	fileData.erase(fileData.begin(), fileData.end());
	clusters.erase(clusters.begin(), clusters.end());

	string fileNum = ("000" + n);
	fileNum = fileNum.substr(fileNum.length() - 3, 3);
	string fileName = "clean.44/" + fileNum + ".csv";

	ifstream myFile(fileName);
	string line;
	string value;

	// values for each point
	float x;
	float y;
	float z;
	float conc;

	POINT* newPoint;

	if (myFile.is_open())
	{
		getline(myFile, line); // gets column names..
		cout << line << endl;

		while (getline(myFile, line)) {
			conc = atof(strtok((char*)line.c_str(), ",")); // concentration
			strtok(NULL, ","); // vel0
			strtok(NULL, ","); // vel1
			strtok(NULL, ","); // vel2
			x = atof(strtok(NULL, ","));
			y = atof(strtok(NULL, ","));
			z = atof(strtok(NULL, ""));

			newPoint = new POINT();
			newPoint->conc = conc;
			newPoint->x = x;
			newPoint->y = y;
			newPoint->z = z;
			newPoint->adj = vector<int>();
			newPoint->inCluster = -1;

			fileData.push_back(newPoint);

		}

		dataLength = fileData.size();

		// find mean
		float total = 0;
		for (int i = 0; i < dataLength; i++) {
			total += fileData[i]->conc;
		}
		mean = total / dataLength;

		// find stddev
		total = 0;
		for (int i = 0; i < dataLength; i++) {
			total += pow((fileData[i]->conc - mean), 2);
		}
		stddev = sqrt(total / dataLength);
		
		minClusterConc = mean + (stddev / 7);
	}

}

void writeFileNumJSON(int num) {
	string fileNum = ("000" + num);
	fileNum = fileNum.substr(fileNum.length() - 3, 3);
	string fileName = "clean.44/" + fileNum + ".csv";

	ofstream outFile;
	outFile.open(fileName);
	// first array bracket
	outFile << "[";

	vector<int> cluster;
	int i, j;
	if (keptClusters.size() > 0) {
		for (i = 0; i < keptClusters.size() - 1; i++) {
			// current cluster
			cluster = keptClusters[i];
			outFile << "[";
			for (j = 0; j < cluster.size() - 1; j++) {
				outFile << cluster[j] << ",";
			}
			outFile << cluster[j] << "],";
		}

		cluster = keptClusters[i];
		outFile << "[";
		for (j = 0; j < cluster.size() - 1; j++) {
			outFile << cluster[j] << ",";
		}
		outFile << cluster[j] << "]";

	}

	outFile << "]";
}

int getIndexOfConc(int val) {
	for (int i = 0; i < dataLength; i++) {
		if (fileData[i]->conc ==  val) return i;
	}
	return -1;
}

int findLargestNotInTopOrUsed() {
	int index = -1;
	float maxSoFar = minClusterConc;

	for (int i = 0; i < dataLength; i++)
	{
		if ((fileData[i]->conc > maxSoFar) &&     // higher concentration
			(fileData[i]->z < (10 - topThickness)) &&  // not in the top section
			(fileData[i]->inCluster == -1)) {            // not in a cluster
			index = i;
			maxSoFar = fileData[i]->conc;
		}
	}

	return index;
}

bool canAddPointToCluster(int ind) {
	// Looks messy but I wanted to make it check the fewest amount of cases
	// instead of doing in 1 return statement.

	if (fileData[ind]->inCluster != -1) {
		return false;
	}
	else if (fileData[ind]->z >= (10 - topThickness)) {
		return false;
	}
	else if (fileData[ind]->conc <= minClusterConc) {
		return false;
	}
	else {
		return true;
	}

}

void clearClusters() {
	clusters.erase(clusters.begin(), clusters.end());
	for (int i = 0; i < dataLength; i++) {
		fileData[i]->inCluster = -1;
	}
}

