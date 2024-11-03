
function kMeans(points, k, maxIterations = 100) {
  //Initialize centroids by randomly selecting `k` points from the dataset
  let centroids = points.slice(0, k).map(() => {
    const randomPoint = points[Math.floor(Math.random() * points.length)];
    return [randomPoint[0], randomPoint[1]]; // Create new array instead of reference
  });
  let assignments = new Array(points.length);
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    //Assign points to the nearest centroid
    let isChanged = false;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      for (let j = 0; j < k; j++) {
        const centroid = centroids[j];
        const distance = Math.hypot(point[0] - centroid[0], point[1] - centroid[1]);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }

      if (assignments[i] !== closestCentroid) {
        assignments[i] = closestCentroid;
        isChanged = true;
      }
    }

    //Update centroids by averaging points assigned to each centroid
    const newCentroids = Array.from({ length: k }, () => [0, 0]);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < points.length; i++) {
      const cluster = assignments[i];
      newCentroids[cluster][0] += points[i][0];
      newCentroids[cluster][1] += points[i][1];
      counts[cluster]++;
    }

    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j][0] = newCentroids[j][0] / counts[j];
        centroids[j][1] = newCentroids[j][1] / counts[j];
      }
    }

    // Stop if no assignments changed
    if (!isChanged) break;
  }

  return { centroids, assignments };
}

function findLargestCluster(points, k) {
  const { centroids, assignments } = kMeans(points, k);
  
  // Count the number of points in each cluster
  const clusterSizes = new Array(k).fill(0);
  assignments.forEach(cluster => {
    clusterSizes[cluster]++;
  });
  
  // Find the largest cluster
  const largestClusterIndex = clusterSizes.indexOf(Math.max(...clusterSizes));
  const largestClusterPoints = points.filter((_, index) => assignments[index] === largestClusterIndex);

  return {
    largestClusterCentroid: centroids[largestClusterIndex],
    largestClusterPoints,
    largestClusterSize: clusterSizes[largestClusterIndex]
  };
}

// Return the centroid of the largest cluster
export default function returnLargestCentroid(points, k){
    const {largestClusterCentroid, largestClusterPoints, largestClusterSize} = findLargestCluster(points, k)
    return largestClusterCentroid;
}

