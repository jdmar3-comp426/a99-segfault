/*
    Defines classes to be used in game logic.
 */

class Direction {
    // essentially an enum class
    static N = new Direction("north");
    static S = new Direction("south");
    static W = new Direction("west");
    static E = new Direction("east");
    static NS = new Direction("north-south");
    static EW = new Direction("east-west");
    static NW = new Direction("north-west");
    static SW = new Direction("south-west");
    static NE = new Direction("north-east");
    static SE = new Direction("south-east")

    static headDirections = [Direction.N, Direction.S, Direction.E, Direction.W];
    static bodyDirections = [Direction.NS, Direction.EW, Direction.NW, Direction.SW, Direction.NE, Direction.SE];

    constructor(name) {
        this.name = name;
    }

    combine(other) {
        if (!(other instanceof Direction)) throw new Error("Invalid direction");
        const dirInts = [Direction.headDirections.indexOf(this), Direction.headDirections.indexOf(other)].sort();
        if (dirInts.includes(-1)) throw new Error("Can't combine non-head directions");

        switch (dirInts[0]) {
            case 0:
                switch (dirInts[1]) {
                    case 1:
                        return Direction.NS;
                    case 2:
                        return Direction.NE;
                    case 3:
                        return Direction.NW;
                }
                break;
            case 1:
                switch (dirInts[1]) {
                    case 2:
                        return Direction.SE;
                    case 3:
                        return Direction.SW;
                }
                break;
            case 2:
                return Direction.EW;
        }
    }
}

class Point {
    constructor(y, x, dir = Direction.E) {
        if (!(dir instanceof Direction)) throw new Error("Invalid direction");
        this.y = y;
        this.x = x;
        this.dir = dir;
    }

    get direction() {
        return this.dir;
    }

    set direction(dir) {
        if (!(dir instanceof Direction)) throw new Error("Invalid direction");
        this.dir = dir;
    }

    equals(other) {
        return this.y === other.y && this.x === other.x;
    }

    * [Symbol.iterator]() {
        yield this.y;
        yield this.x;
    }
}


class Snake {
    constructor() {
        this.points = [new Point(0, 0, Direction.E), new Point(0, 1, Direction.E), new Point(0, 2, Direction.E)];
        this.oldDirection = Direction.E;
        this.direction = Direction.E;
    }

    get length() {
        return this.points.length;
    }

    get head() {
        return this.points[this.length - 1];
    }

    hasPoint(p) {
        for (const point of this.points) {
            if (point.equals(p)) return true;
        }
        return false;
    }
}