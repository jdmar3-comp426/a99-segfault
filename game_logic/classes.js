/*
    Defines classes to be used in game logic.
 */

class LoadedImage {
    static HeadNorth = new LoadedImage("https://i.imgur.com/SzibTAr.png");
    static HeadEast = new LoadedImage("https://i.imgur.com/aty89Dm.png");
    static HeadSouth = new LoadedImage("https://i.imgur.com/CDPu6N5.png");
    static HeadWest = new LoadedImage("https://i.imgur.com/FOvnnXO.png");
    static Body = new LoadedImage("https://i.imgur.com/8HVeW6i.png");
    static BodyNS = new LoadedImage("https://i.imgur.com/GOGK4AG.png");
    static BodyEW = new LoadedImage("https://i.imgur.com/Gxc7fn4.png");
    static BodyNW = new LoadedImage("https://i.imgur.com/FMAt9Ui.png");
    static BodySW = new LoadedImage("https://i.imgur.com/xJKPW7B.png");
    static BodyNE = new LoadedImage("https://i.imgur.com/33kiGvi.png");
    static BodySE = new LoadedImage("https://i.imgur.com/962f40B.png");
    static FruitApple = new LoadedImage("https://preview.redd.it/bxcbiiu1wxa71.png?auto=webp&s=709c4efa8fc567e9f16aeda1008ccd5b700c3052");
    static FruitGreenApple = new LoadedImage("https://i.imgur.com/ORJbhEo.png");

    static TrafficCone = new LoadedImage("https://i.imgur.com/wL4luTP.png");

    constructor(src) {
        this.image = new Image();
        this.image.src = src;
    }
}

class Gamemode {
    static DontStarve = new Gamemode("Don't Starve");
    static ObstacleCourse = new Gamemode("Obstacle Course");

    constructor (name) {
        this.name = name;
    }
}

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

    get opposite() {
        switch (this) {
            case Direction.N:
                return Direction.S;
            case Direction.S:
                return Direction.N;
            case Direction.W:
                return Direction.E;
            case Direction.E:
                return Direction.W;
        }
    }

    combine(other) {
        if (!(other instanceof Direction)) throw new Error("Invalid direction");
        const dirInts = [Direction.headDirections.indexOf(this), Direction.headDirections.indexOf(other)].sort();
        if (dirInts.includes(-1)) throw new Error("Can't combine non-head directions");

        switch (dirInts[0]) {
            case 0:
                switch (dirInts[1]) {
                    case 0:
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
                    case 1:
                        return Direction.NS;
                    case 2:
                        return Direction.SE;
                    case 3:
                        return Direction.SW;
                }
                break;
            case 2:
            case 3:
                return Direction.EW;
        }
    }
}

class Point {
    constructor(y, x, dir = Direction.E, drawDir = Direction.EW) {
        if (!(dir instanceof Direction) || !(drawDir instanceof Direction)) throw new Error("Invalid direction");
        this.y = y;
        this.x = x;
        this.dir = dir;
        this.drawDir = drawDir;
    }

    get direction() {
        return this.dir;
    }

    set direction(dir) {
        if (!(dir instanceof Direction)) throw new Error("Invalid direction");
        this.dir = dir;
    }

    get drawDirection() {
        return this.drawDir;
    }

    set drawDirection(drawDir) {
        if (!(drawDir instanceof Direction)) setTimeout(() => {
            console.log(drawDir);
        }, 2000);//throw new Error("Invalid direction");
        this.drawDir = drawDir;
    }

    equals(other) {
        if (!(other instanceof Point)) return false;
        return this.y === other.y && this.x === other.x;
    }

    * [Symbol.iterator]() {
        yield this.y;
        yield this.x;
    }
}


class Snake {
    constructor() {
        this.points = [
            new Point(0, 0, Direction.E, Direction.EW),
            new Point(0, 1, Direction.E, Direction.EW),
            new Point(0, 2, Direction.E, Direction.EW)];
        this.direction = Direction.E;
    }

    get length() {
        return this.points.length;
    }

    get head() {
        return this.points[this.length - 1];
    }

    get tail() {
        return this.points[0];
    }

    hasPoint(p) {
        for (const point of this.points) {
            if (point.equals(p)) return true;
        }
        return false;
    }
}