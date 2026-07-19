export type WeightedGraph = Record<string, Record<string, number>>;

export function dijkstra(graph: WeightedGraph, start: string, goal: string) {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of unvisited) {
    distances[node] = node === start ? 0 : Number.POSITIVE_INFINITY;
    previous[node] = null;
  }

  while (unvisited.size) {
    const current = [...unvisited].reduce((best, node) =>
      distances[node] < distances[best] ? node : best
    );
    if (!Number.isFinite(distances[current]) || current === goal) break;
    unvisited.delete(current);

    for (const [neighbour, weight] of Object.entries(graph[current] ?? {})) {
      if (!unvisited.has(neighbour)) continue;
      const candidate = distances[current] + weight;
      if (candidate < distances[neighbour]) {
        distances[neighbour] = candidate;
        previous[neighbour] = current;
      }
    }
  }

  const path: string[] = [];
  let cursor: string | null = goal;
  while (cursor) {
    path.unshift(cursor);
    cursor = previous[cursor];
  }
  return { path: path[0] === start ? path : [], distance: distances[goal] };
}
