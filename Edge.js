var EdgeJS;
(function (EdgeJS) {
    var SimpleNode = (function () {
        function SimpleNode(id, name) {
            this.id = id;
            this.name = name;
        }
        SimpleNode.prototype.getId = function () {
            return this.id;
        };
        SimpleNode.prototype.toString = function () {
            return "SimpleNode " + this.id;
        };
        return SimpleNode;
    })();
    EdgeJS.SimpleNode = SimpleNode;    
    var SimpleEdge = (function () {
        function SimpleEdge(source, target) {
            this.source = source;
            this.target = target;
        }
        SimpleEdge.prototype.getSource = function () {
            return this.source;
        };
        SimpleEdge.prototype.getTarget = function () {
            return this.target;
        };
        return SimpleEdge;
    })();
    EdgeJS.SimpleEdge = SimpleEdge;    
    var SimpleGraph = (function () {
        function SimpleGraph() {
            this.nodesById = {
            };
            this.nodes = new Array();
            this.edgeByNode = {
            };
        }
        SimpleGraph.prototype.getNodeCount = function () {
            return this.nodes.length;
        };
        SimpleGraph.prototype.getNodes = function () {
            return this.nodes;
        };
        SimpleGraph.prototype.getEdges = function (n) {
            var id = n.getId();
            var r = this.edgeByNode[id];
            if(r === undefined) {
                r = new Array();
            }
            return r;
        };
        SimpleGraph.prototype.getOpposite = function (node, edge) {
            if(edge.getSource() === node.getId()) {
                return this.nodesById[edge.getTarget()];
            }
            if(edge.getTarget() === node.getId()) {
                return this.nodesById[edge.getSource()];
            }
            throw new Error("The edge does not contain the nodes in either side");
        };
        SimpleGraph.prototype.addNode = function (node) {
            this.nodesById[node.getId()] = node;
            this.nodes.push(node);
        };
        SimpleGraph.prototype.addEdge = function (edge) {
            var edges = this.edgeByNode[edge.getSource()] || (this.edgeByNode[edge.getSource()] = new Array());
            edges.push(edge);
            edges = this.edgeByNode[edge.getTarget()] || (this.edgeByNode[edge.getTarget()] = new Array());
            edges.push(edge);
        };
        return SimpleGraph;
    })();
    EdgeJS.SimpleGraph = SimpleGraph;    
    var MeasureResults = (function () {
        function MeasureResults() {
            this.results = {
            };
        }
        MeasureResults.prototype.add = function (node, result) {
            this.results[node.getId()] = result;
        };
        MeasureResults.prototype.get = function (node) {
            return this.results[node.getId()];
        };
        MeasureResults.prototype.getById = function (nid) {
            return this.results[nid];
        };
        MeasureResults.prototype.toString = function () {
            var s = "";
            var nid;
            for(nid in this.results) {
                s += "\n";
                s += nid + ":\n";
                var res = this.results[nid];
                s += "eccen: " + res.Eccentricity + " between: " + res.Betweenness + " close:" + res.Closeness;
            }
            return s + "\n";
        };
        return MeasureResults;
    })();
    EdgeJS.MeasureResults = MeasureResults;    
    var MeasureResult = (function () {
        function MeasureResult(Eccentricity, Closeness, Betweenness) {
            this.Eccentricity = Eccentricity;
            this.Closeness = Closeness;
            this.Betweenness = Betweenness;
        }
        return MeasureResult;
    })();
    EdgeJS.MeasureResult = MeasureResult;    
    var Measure = (function () {
        function Measure() { }
        Measure.prototype.zeroArrayOf = function (n) {
            return (function () {
                var a = [];
                var i;
                for(i = 0; i < n; i++) {
                    a[i] = 0;
                }
                console.log("new array", a);
                return a;
            })();
        };
        Measure.prototype.execute = function (hgraph, results) {
            this.N = hgraph.getNodeCount();
            var betweenness = this.zeroArrayOf(this.N);
            var eccentricity = this.zeroArrayOf(this.N);
            var closeness = this.zeroArrayOf(this.N);
            this.diameter = 0;
            this.avgDist = 0;
            this.shortestPaths = 0;
            this.radius = Number.MAX_VALUE;
            var indicies = {
            };
            var index = 0;
            var it;
            var s;
            var allNodes = hgraph.getNodes();
            for(it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                indicies[s.getId()] = index;
                index++;
            }
            var count = 0;
            for(it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                var ns = new Array();
                var P = new Array();
                var theta = new Array();
                var d = new Array();
                var j;
                for(j = 0; j < this.N; j++) {
                    P[j] = new Array();
                    theta[j] = 0;
                    d[j] = -1;
                }
                var s_index = indicies[s.getId()];
                theta[s_index] = 1;
                d[s_index] = 0;
                var Q = new Array();
                Q.push(s);
                while(Q.length > 0) {
                    var v = Q.pop();
                    ns.push(v);
                    var v_index = indicies[v.getId()];
                    var nodeEdges = hgraph.getEdges(v);
                    var edge;
                    var edgeIt;
                    for(edgeIt = 0; edgeIt < nodeEdges.length; edgeIt++) {
                        edge = nodeEdges[edgeIt];
                        var reachable = hgraph.getOpposite(v, edge);
                        var r_index = indicies[reachable.getId()];
                        if(d[r_index] < 0) {
                            Q.push(reachable);
                            d[r_index] = d[v_index] + 1;
                        }
                        if(d[r_index] == (d[v_index] + 1)) {
                            theta[r_index] = theta[r_index] + theta[v_index];
                            P[r_index].push(v);
                        }
                    }
                }
                var reachableCount = 0;
                var i;
                for(i = 0; i < this.N; i++) {
                    if(d[i] > 0) {
                        this.avgDist += d[i];
                        eccentricity[s_index] = Math.max(eccentricity[s_index], d[i]);
                        closeness[s_index] += d[i];
                        this.diameter = Math.max(this.diameter, d[i]);
                        reachableCount++;
                    }
                }
                this.radius = Math.min(eccentricity[s_index], this.radius);
                if(reachableCount != 0) {
                    closeness[s_index] /= reachableCount;
                }
                this.shortestPaths += reachableCount;
                var delta = this.zeroArrayOf(this.N);
                while(ns.length > 0) {
                    var w = ns.pop();
                    var w_index = indicies[w.getId()];
                    var pIt;
                    for(pIt = 0; pIt < P[w_index].length; pIt++) {
                        var u = P[w_index][pIt];
                        var u_index = indicies[u.getId()];
                        delta[u_index] += (theta[u_index] / theta[w_index]) * (1 + delta[w_index]);
                    }
                    if(w != s) {
                        betweenness[w_index] += delta[w_index];
                    }
                }
                count++;
            }
            this.avgDist /= this.shortestPaths;
            for(it = 0; it < allNodes.length; it++) {
                s = allNodes[it];
                s_index = indicies[s.getId()];
                betweenness[s_index] /= 2;
                if(this.isNormalized) {
                    closeness[s_index] = (closeness[s_index] == 0) ? 0 : 1 / closeness[s_index];
                    betweenness[s_index] /= this.isDirected ? (this.N - 1) * (this.N - 2) : (this.N - 1) * (this.N - 2) / 2;
                }
                results.add(s, new MeasureResult(eccentricity[s_index], closeness[s_index], betweenness[s_index]));
            }
        };
        return Measure;
    })();
    EdgeJS.Measure = Measure;    
})(EdgeJS || (EdgeJS = {}));

