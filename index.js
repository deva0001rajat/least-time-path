window.onload = function () {
    const container = document.getElementById('container');
    const container2 = document.getElementById('container2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const temptext = document.getElementById('temp');
    const temptext2 = document.getElementById('temp2');

    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf072', // Code for the flight icon
                size: 40,
                color: '#991133',
            }
        }
    };
    
    const network = new vis.Network(document.getElementById('work'), {}, options);
    const network2 = new vis.Network(document.getElementById('work2'), {}, options);

    function createData() {
        const cities = ['Delhi', 'Mumbai', 'Gujarat', 'Goa', 'Kanpur', 'Jammu', 'Hyderabad', 'Bangalore', 'Gangtok', 'Meghalaya'];
        const V = Math.floor(Math.random() * cities.length) + 3;

        let nodes = [];
        for (let i = 1; i <= V; i++) {
            nodes.push({ id: i, label: cities[i - 1] });
        }

        let edges = [];
        for (let i = 2; i <= V; i++) {
            let neigh = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1);
            edges.push({ type: 0, from: i, to: neigh, color: 'orange', label: String(Math.floor(Math.random() * 70) + 31) });
        }
        let src = 1;
        let dst = V;
        for (let i = 1; i <= V / 2;) {
            let n1 = Math.floor(Math.random() * V) + 1;
            let n2 = Math.floor(Math.random() * V) + 1;
            if (n1 != n2) {
                if (n1 < n2) {
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }
                let works = 0;
                for (let j = 0; j < edges.length; j++) {
                    if (edges[j]['from'] == n1 && edges[j]['to'] == n2) {
                        if (edges[j]['type'] == 0)
                            works = 1;
                        else
                            works = 2;
                    }
                }
                if (works <= 1) {
                    if (works == 0 && i < V / 4) {
                        edges.push({
                            type: 0, from: n1, to: n2, color: 'orange', label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        edges.push({
                            type: 1, from: n1, to: n2, color: 'green', label: String(Math.floor(Math.random() * 50) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        let data = {
            nodes: nodes, edges: edges, src: src, dst: dst
        };
        curr_data = data;
        return data;
    }

    genNew.onclick = function () {
        curr_data = createData();
        network.setData(curr_data);
        temptext2.innerText = 'Find least time path from ' + curr_data.nodes[curr_data.src - 1].label + ' to ' + curr_data.nodes[curr_data.dst - 1].label;
        temptext.style.display = "none";
        temptext2.style.display = "block";
        container2.style.display = "none";
    };

    solve.onclick = function () {
        temptext.style.display = "none";
        temptext2.style.display = "none";
        container2.style.display = "block";

        let data = solveData(curr_data.nodes.length);
        network2.setData(data);
    };

    function solveData(sz) {
        let data = curr_data;
        let graph = [];
        for (let i = 0; i < sz; i++) {
            graph.push([]);
        }

        for (let i = 0; i < data['edges'].length; i++) {
            let edge = data['edges'][i];
            if (edge['type'] === 1)
                continue;

            graph[edge['to'] - 1].push([edge['from'] - 1, parseInt(edge.label)]);
            graph[edge['from'] - 1].push([edge['to'] - 1, parseInt(edge.label)]);
        }

        let dist1 = dijkstra(graph, sz, data.src - 1);
        let dist2 = dijkstra(graph, sz, data.dst - 1);
        let mn_dist = dist1[data.dst - 1][0];
        let plane = 0;
        let p1 = -1, p2 = -1;

        for (let pos in data['edges']) {
            let edge = data['edges'][pos];
            if (edge['type'] == 1) {
                let to = edge['to'] - 1;
                let from = edge['from'] - 1;
                let wght = parseInt(edge.label);

                if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
                    plane = wght;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0] + wght + dist2[from][0];
                }
                if (dist1[from][0] + wght + dist2[to][0] < mn_dist) {
                    plane = wght;
                    p1 = from;
                    p2 = to;
                    mn_dist = dist1[from][0] + wght + dist2[to][0];
                }
            }
        }

        let edges = [];
        if (plane == 0) {
            let node = data.dst - 1;
            while (node != data.src - 1) {
                let next_node = dist1[node][1];
                edges.push({ from: node + 1, to: next_node + 1, color: 'orange', label: String(dist1[node][0] - dist1[next_node][0]) });
                node = next_node;
            }
        } else {
            let node = p1;
            while (node != data.src - 1) {
                let next_node = dist1[node][1];
                edges.push({ from: node + 1, to: next_node + 1, color: 'orange', label: String(dist1[node][0] - dist1[next_node][0]) });
                node = next_node;
            }
            edges.push({ from: p1 + 1, to: p2 + 1, color: 'green', label: String(plane) });
            node = p2;
            while (node != data.dst - 1) {
                let next_node = dist2[node][1];
                edges.push({ from: node + 1, to: next_node + 1, color: 'orange', label: String(dist2[node][0] - dist2[next_node][0]) });
                node = next_node;
            }
        }

        let solved_data = {
            nodes: data.nodes, edges: edges
        };
        return solved_data;
    }

    function dijkstra(graph, sz, src) {
        let vis = [];
        for (let i = 0; i < sz; i++) {
            vis.push(0);
        }

        let dist = [];
        for (let i = 0; i < sz; i++) {
            dist.push([1000000000, -1]);
        }

        dist[src][0] = 0;

        for (let i = 0; i < sz; i++) {
            let node = -1;
            for (let j = 0; j < sz; j++) {
                if (vis[j] == 0) {
                    if (node == -1 || dist[j][0] < dist[node][0]) {
                        node = j;
                    }
                }
            }

            vis[node] = 1;

            for (let j = 0; j < graph[node].length; j++) {
                let edge = graph[node][j];
                if (dist[edge[0]][0] > dist[node][0] + edge[1]) {
                    dist[edge[0]][0] = dist[node][0] + edge[1];
                    dist[edge[0]][1] = node;
                }
            }
        }

        return dist;
    }
}
