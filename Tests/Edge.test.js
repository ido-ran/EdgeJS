/// <reference path="../Edge.js" />

beforeEach(function() {
    this.addMatchers({
        toMatchArray: function (expected) {
            var arr = this.actual
              , env = this.env;
            if (arr.length != expected.length) return false;  //throw new Error("Actual and expeact have different number of elements");
            for (var i = 0; i < expected.length; i++) {
                var a = arr[i],
                    e = expected[i];
                if (a != e) return false;
            }
            return true;
        }
    });
});

describe("Graph", function () {
    it("Empty should return zreo nodes", function () {
        var g = new EdgeJS.SimpleGraph();
        var actual = g.getNodeCount();
        expect(actual).toEqual(0);
    });

    it("Add 5 nodes should return node count of 5", function () {
        var g = new EdgeJS.SimpleGraph();
        for (var i = 0; i < 5; i++) {
            var nodeName = i.toString();
            var node = new EdgeJS.SimpleNode(nodeName, nodeName);
            g.addNode(node);
        }

        var actual = g.getNodeCount();
        expect(actual).toEqual(5);
    });

    it("Add 5 nodes should get 5 nodes back", function () {
        var g = new EdgeJS.SimpleGraph();
        for (var i = 1; i <= 5; i++) {
            var nodeName = i.toString();
            var node = new EdgeJS.SimpleNode(nodeName, nodeName);
            g.addNode(node);
        }

        var actualNodes = g.getNodes();
        var actualNodeIds = actualNodes.map(function(i) { return i.getId(); });
        expect(actualNodeIds).toMatchArray(["1", "2", "3", "4", "5"]);
    });

    it("Get link of node connected to 2 other nodes", function () {
        var g = new EdgeJS.SimpleGraph();
        var nodeA = new EdgeJS.SimpleNode("A", "A");
        var nodeB = new EdgeJS.SimpleNode("B", "B");
        var nodeC = new EdgeJS.SimpleNode("C", "C");
        g.addNode(nodeA);
        g.addNode(nodeB);
        g.addNode(nodeC);
        g.addNode(new EdgeJS.SimpleNode("D", "D"));

        var edgeToB = new EdgeJS.SimpleEdge("A", "B");
        g.addEdge(edgeToB);
        var edgeToC = new EdgeJS.SimpleEdge("A", "C");
        g.addEdge(edgeToC);

        var links = g.getEdges(nodeA);

        expect(links).toMatchArray([edgeToB, edgeToC]);
    });

    it("Get back link", function () {
        var g = new EdgeJS.SimpleGraph();
        var nodeA = new EdgeJS.SimpleNode("A", "A");
        var nodeB = new EdgeJS.SimpleNode("B", "B");
        var nodeC = new EdgeJS.SimpleNode("C", "C");
        g.addNode(nodeA);
        g.addNode(nodeB);
        g.addNode(nodeC);
        g.addNode(new EdgeJS.SimpleNode("D", "D"));

        var edgeAB = new EdgeJS.SimpleEdge("A", "B");
        g.addEdge(edgeAB);
        var edgeAC = new EdgeJS.SimpleEdge("A", "C");
        g.addEdge(edgeAC);

        var links = g.getEdges(nodeB);

        expect(links).toMatchArray([edgeAB]);
    });

    it("getOpposite return the other node", function () {
        var g = new EdgeJS.SimpleGraph();
        var nodeA = new EdgeJS.SimpleNode("A", "A");
        var nodeB = new EdgeJS.SimpleNode("B", "B");
        g.addNode(nodeA);
        g.addNode(nodeB);

        var edgeToB = new EdgeJS.SimpleEdge("A", "B");
        g.addEdge(edgeToB);

        var otherNode = g.getOpposite(nodeB, edgeToB);

        expect(otherNode).toEqual(nodeA);
    });
});


describe("EdgeJS-Measure", function () {
    it("two nodes with link between them", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "B"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(0);
    });

    it("two nodes with 2 link between them", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "B"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "A"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(0);
    });

    it("three nodes with links between them", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));
        g.addNode(new EdgeJS.SimpleNode("C", "C"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "B"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "C"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toEqual(1.5);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(1);

        nr = results.getById("C");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toEqual(1.5);
        expect(nr.Betweenness).toEqual(0);
    });

    it("three nodes with 2 links between them", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));
        g.addNode(new EdgeJS.SimpleNode("C", "C"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "B"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "A"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "C"));
        g.addEdge(new EdgeJS.SimpleEdge("C", "B"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toEqual(1.5);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(1);

        nr = results.getById("C");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toEqual(1.5);
        expect(nr.Betweenness).toEqual(0);
    });

    it("4 nodes with node3 in the middle", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));
        g.addNode(new EdgeJS.SimpleNode("C", "C"));
        g.addNode(new EdgeJS.SimpleNode("D", "D"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "C"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "C"));
        g.addEdge(new EdgeJS.SimpleEdge("C", "D"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.667,0.01);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.667, 0.01);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("C");
        expect(nr.Eccentricity).toEqual(1);
        expect(nr.Closeness).toEqual(1);
        expect(nr.Betweenness).toEqual(3);

        nr = results.getById("D");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.667, 0.01);
        expect(nr.Betweenness).toEqual(0);
    });

    it("4 nodes connected as square", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("A", "A"));
        g.addNode(new EdgeJS.SimpleNode("B", "B"));
        g.addNode(new EdgeJS.SimpleNode("C", "C"));
        g.addNode(new EdgeJS.SimpleNode("D", "D"));

        g.addEdge(new EdgeJS.SimpleEdge("A", "B"));
        g.addEdge(new EdgeJS.SimpleEdge("B", "C"));
        g.addEdge(new EdgeJS.SimpleEdge("C", "D"));
        g.addEdge(new EdgeJS.SimpleEdge("A", "D"));

        var m1 = new EdgeJS.Measure();
        console.log("test", m1);
        var results = new EdgeJS.MeasureResults();

        m1.execute(g, results);

        console.log("square", g, results);

        var nr = results.getById("A");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.333, 0.01);
        expect(nr.Betweenness).toEqual(0.25);

        nr = results.getById("B");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.333, 0.01);
        expect(nr.Betweenness).toEqual(0.25);

        nr = results.getById("C");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.333, 0.01);
        expect(nr.Betweenness).toEqual(0.25);

        nr = results.getById("D");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.333, 0.01);
        expect(nr.Betweenness).toEqual(0.25);
    });
});

describe("7 nodes measurement", function () {

    it("Ecentricity", function () {
        var g = new EdgeJS.SimpleGraph();
        g.addNode(new EdgeJS.SimpleNode("1", "1"));
        g.addNode(new EdgeJS.SimpleNode("2", "2"));
        g.addNode(new EdgeJS.SimpleNode("3", "3"));
        g.addNode(new EdgeJS.SimpleNode("4", "4"));
        g.addNode(new EdgeJS.SimpleNode("5", "5"));
        g.addNode(new EdgeJS.SimpleNode("6", "6"));
        g.addNode(new EdgeJS.SimpleNode("7", "7"));

        g.addEdge(new EdgeJS.SimpleEdge("1", "3"));
        g.addEdge(new EdgeJS.SimpleEdge("2", "3"));
        g.addEdge(new EdgeJS.SimpleEdge("3", "4"));
        g.addEdge(new EdgeJS.SimpleEdge("4", "5"));
        g.addEdge(new EdgeJS.SimpleEdge("5", "6"));
        g.addEdge(new EdgeJS.SimpleEdge("7", "6"));
        g.addEdge(new EdgeJS.SimpleEdge("5", "7"));

        var m = new EdgeJS.Measure();
        var results = new EdgeJS.MeasureResults();

        m.execute(g, results);

        var nr = results.getById("1");
        console.log("1");
        expect(nr.Eccentricity).toEqual(4);
        expect(nr.Closeness).toBeCloseTo(2.667, 0.01);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("2");
        console.log("2");
        expect(nr.Eccentricity).toEqual(4);
        expect(nr.Closeness).toBeCloseTo(2.667, 0.01);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("3");
        console.log("3");
        expect(nr.Eccentricity).toEqual(3);
        expect(nr.Closeness).toBeCloseTo(1.833, 0.01);
        expect(nr.Betweenness).toEqual(9);

        nr = results.getById("4");
        console.log("4");
        expect(nr.Eccentricity).toEqual(2);
        expect(nr.Closeness).toBeCloseTo(1.667, 0.01);
        expect(nr.Betweenness).toEqual(9);

        nr = results.getById("5");
        console.log("5");
        expect(nr.Eccentricity).toEqual(3);
        expect(nr.Closeness).toBeCloseTo(1.833, 0.01);
        expect(nr.Betweenness).toEqual(8);

        nr = results.getById("6");
        console.log("6");
        expect(nr.Eccentricity).toEqual(4);
        expect(nr.Closeness).toBeCloseTo(2.5, 0.01);
        expect(nr.Betweenness).toEqual(0);

        nr = results.getById("7");
        console.log("7");
        expect(nr.Eccentricity).toEqual(4);
        expect(nr.Closeness).toBeCloseTo(2.5, 0.01);
        expect(nr.Betweenness).toEqual(0);

    });
});