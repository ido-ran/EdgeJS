/*
    EdgeJS - Graph Measurement Library

    ido.ran@gmail.com
*/
module EdgeJS {

    export interface Node {
        getId(): string;
    }

    export interface Edge {
        getSource(): string;
        getTarget(): string;
    }

    export interface Graph {
        getNodeCount(): number;
        getNodes(): Node[];
        getEdges(n: Node);
        getOpposite(node: Node, edge: Edge): Node;

        addNode(node: Node): void;
        addEdge(edge: Edge): void;
    }

    export class SimpleNode implements Node {
        constructor (public id: string, public name: string) { }

        public getId(): string { return this.id; }

        toString(): string {
            return "SimpleNode " + this.id;
        }
    }

    export class SimpleEdge implements Edge {
        constructor (public source: string, public target: string) { }

        public getSource(): string { return this.source; }
        public getTarget(): string { return this.target; }

    }

    export class SimpleGraph implements Graph {

        private nodesById = {};
        private nodes: Node[] = new Node[];
        private edgeByNode = {};

        public getNodeCount(): number { return this.nodes.length; }
        public getNodes(): Node[] { return this.nodes; }
        public getEdges(n: Node) {
            var id: string = n.getId();
            var r: Edge[] = this.edgeByNode[id];
            if (r === undefined) r = new Edge[];
            return r;
        }
        public getOpposite(node: Node, edge: Edge): Node {
            if (edge.getSource() === node.getId()) return this.nodesById[edge.getTarget()];
            if (edge.getTarget() === node.getId()) return this.nodesById[edge.getSource()];
            throw new Error("The edge does not contain the nodes in either side");
        }

        public addNode(node: Node): void {
            this.nodesById[node.getId()] = node;
            this.nodes.push(node);
        }

        public addEdge(edge: Edge): void {
            // Add edge to source node.
            var edges: Edge[] = this.edgeByNode[edge.getSource()] || (this.edgeByNode[edge.getSource()] = new Edge[]);
            edges.push(edge);

            // Add edge to target node.
            edges = this.edgeByNode[edge.getTarget()] || (this.edgeByNode[edge.getTarget()] = new Edge[]);
            edges.push(edge);
        }
    }

    export class MeasureResults {
        private results = {};

        add(node: Node, result: MeasureResult): void {
            this.results[node.getId()] = result;
        }

        get(node: Node): MeasureResult {
            return this.results[node.getId()];
        }

        getById(nid: string): MeasureResult {
            return this.results[nid];
        }

        toString(): string {
            var s: string = "";
            var nid: string;
            for (nid in this.results) {
                s += "\n";
                s += nid + ":\n";
                var res: MeasureResult = this.results[nid];
                s += "eccen: " + res.Eccentricity + " between: " + res.Betweenness + " close:" + res.Closeness;
            }

            return s + "\n";
        }
    }

    export class MeasureResult {
        constructor (
            public Eccentricity: number,
            public Closeness: number,
            public Betweenness: number) {

        }
    }

    export class Measure {
        private N: number;

        private diameter: number;
        private radius: number;
        private avgDist: number;
        private isDirected: bool;
        private isCanceled: bool;
        private shortestPaths: number;
        private isNormalized: bool;

        private zeroArrayOf(n: number): number[] {
            return (function () {
                var a = [];
                var i;
                for (i = 0; i < n; i++) {
                    a[i] = 0;
                }
                console.log("new array", a);
                return a;
            })();
        };

        public execute(hgraph: Graph, results: MeasureResults) {
            this.N = hgraph.getNodeCount();


            var betweenness: number[] = this.zeroArrayOf(this.N);
            var eccentricity: number[] = this.zeroArrayOf(this.N);
            var closeness: number[] = this.zeroArrayOf(this.N);

            //console.log("bet1", betweenness, this);
            this.diameter = 0;
            this.avgDist = 0;
            this.shortestPaths = 0;
            this.radius = Number.MAX_VALUE;
            var indicies = {};
            var index: number = 0;

            var it: number;
            var s: Node;
            
            var allNodes: Node[] = hgraph.getNodes();
            for (it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                indicies[s.getId()] = index;
                index++;
            }

            // Start calculating mesures.
            var count: number = 0;
            for (it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                var ns = new Node[];

                var P = new Node[][];
                var theta = new number[];
                var d = new number[];
                var j: number;
                for (j = 0; j < this.N; j++) {
                    P[j] = new Node[];
                    theta[j] = 0;
                    d[j] = -1;
                }

                var s_index: number = indicies[s.getId()];

                theta[s_index] = 1;
                d[s_index] = 0;

                var Q = new Node[];
                Q.push(s);
                while (Q.length > 0) {
                    var v: Node = Q.pop();

                    ns.push(v);
                    var v_index: number = indicies[v.getId()];

                    var nodeEdges: Edge[] = hgraph.getEdges(v);

                    var edge: Edge;
                    var edgeIt: number;
                    for (edgeIt = 0; edgeIt < nodeEdges.length; edgeIt++) {
                        edge = nodeEdges[edgeIt];
                        var reachable: Node = hgraph.getOpposite(v, edge);
                        var r_index: number = indicies[reachable.getId()];
                        if (d[r_index] < 0) {
                            Q.push(reachable);
                            d[r_index] = d[v_index] + 1;
                        }
                        if (d[r_index] == (d[v_index] + 1)) {
                            theta[r_index] = theta[r_index] + theta[v_index];
                            P[r_index].push(v);
                        }
                    }
                }
                //console.log(s.getId(), P);
                var reachableCount: number = 0;
                var i: any;
                for (i = 0; i < this.N; i++) {
                    if (d[i] > 0) {
                        this.avgDist += d[i];
                        eccentricity[s_index] = Math.max(eccentricity[s_index], d[i]);
                        closeness[s_index] += d[i];
                        this.diameter = Math.max(this.diameter, d[i]);
                        reachableCount++;
                    }
                }

                this.radius = Math.min(eccentricity[s_index], this.radius);

                if (reachableCount != 0) {
                    closeness[s_index] /= reachableCount;
                }

                this.shortestPaths += reachableCount;

                var delta = this.zeroArrayOf(this.N);
                while (ns.length > 0) {
                    var w: Node = ns.pop();
                    var w_index: number = indicies[w.getId()];
                    var pIt: number;
                    for (pIt = 0; pIt < P[w_index].length; pIt++) {
                        var u: Node = P[w_index][pIt];
                        var u_index: number = indicies[u.getId()];
                        delta[u_index] += (theta[u_index] / theta[w_index]) * (1 + delta[w_index]);
                    }
                    if (w != s) {
                        //console.log("update bet", "s:" + s.getId(), "w:" + w.getId(), this.betweenness[w_index], delta[w_index]);
                        betweenness[w_index] += delta[w_index];
                        //console.log("after update bet", "s:" + s.getId(), "w:" + w.getId(), betweenness[w_index]);
                    }
                }
                count++;
                
                //console.log("bet", betweenness);
                // We can check here if the calc was canceled and stop it.
            }
            //console.log("bet", betweenness);

            //mN * (mN - 1.0f);
            this.avgDist /= this.shortestPaths;

            for (it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                s_index = indicies[s.getId()];

                // We can add here check if the graph is directed or undirected.
                // Currently we only support undirected graph.
                betweenness[s_index] /= 2;
                if (this.isNormalized) {
                    closeness[s_index] = (closeness[s_index] == 0) ? 0 : 1.0 / closeness[s_index];
                    betweenness[s_index] /= this.isDirected ? (this.N - 1) * (this.N - 2) : (this.N - 1) * (this.N - 2) / 2;
                }
                results.add(s, new MeasureResult(
                    eccentricity[s_index],
                    closeness[s_index],
                    betweenness[s_index]));
            }
        }
    }

}
