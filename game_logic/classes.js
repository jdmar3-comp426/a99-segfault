/*
    Defines classes to be used in game logic.
 */

class LoadedImage {
    static HeadNorth = new LoadedImage("https://i.imgur.com/qaHZ08P.png");
    static HeadEast = new LoadedImage("https://i.imgur.com/2tHc7UW.png");
    static HeadSouth = new LoadedImage("https://i.imgur.com/4vnUG9R.png");
    static HeadWest = new LoadedImage("https://i.imgur.com/uWapKA2.png");

    static TailNorth = new LoadedImage("https://i.imgur.com/DfEkjul.png");
    static TailEast = new LoadedImage("https://i.imgur.com/1zypg5W.png");
    static TailSouth = new LoadedImage("https://i.imgur.com/ntBcEZ5.png");
    static TailWest = new LoadedImage("https://i.imgur.com/F8QKyW0.png");

    static Body = new LoadedImage("https://i.imgur.com/uWapKA2.png");
    static BodyNSDebug = new LoadedImage("https://i.imgur.com/GOGK4AG.png");
    static BodyEWDebug = new LoadedImage("https://i.imgur.com/Gxc7fn4.png");
    static BodyNWDebug = new LoadedImage("https://i.imgur.com/FMAt9Ui.png");
    static BodySWDebug = new LoadedImage("https://i.imgur.com/xJKPW7B.png");
    static BodyNEDebug = new LoadedImage("https://i.imgur.com/33kiGvi.png");
    static BodySEDebug = new LoadedImage("https://i.imgur.com/962f40B.png");
    static BodyNS = new LoadedImage("https://i.imgur.com/6qsFgGX.png");
    static BodyEW = new LoadedImage("https://i.imgur.com/zddCIIt.png");
    static BodyNW = new LoadedImage("https://i.imgur.com/uGb4Zre.png");
    static BodySW = new LoadedImage("https://i.imgur.com/zNfYeFe.png");
    static BodyNE = new LoadedImage("https://i.imgur.com/aQ60q5h.png");
    static BodySE = new LoadedImage("https://i.imgur.com/M6fqc1f.png");
    static Rat = new LoadedImage("https://i.imgur.com/pxGwISc.png");
    static Coffee = new LoadedImage("https://i.imgur.com/igbcO05.png");

    //Obstacles

    static TrafficCone = new LoadedImage("https://i.imgur.com/pnQwRLm.png");
    static BlueMailBox = new LoadedImage("https://i.imgur.com/UvEAlcc.png");
    static Bollard = new LoadedImage("https://i.imgur.com/W1AsZYe.png");
    static PottedPlant = new LoadedImage("https://i.imgur.com/QklvbIP.png");
    static RedMailBox = new LoadedImage("https://i.imgur.com/7xgyeTK.png");
    static Tire = new LoadedImage("https://i.imgur.com/UhR1wtI.png");
    static TrashBags = new LoadedImage("https://i.imgur.com/OZsvTfU.png");
    static TrashCan = new LoadedImage("https://i.imgur.com/ThBJnGL.png");

    static Pause = new LoadedImage("https://i.imgur.com/knoGq6K.png");

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
    static NA = new Direction(("none"));
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
            new Point(1, 1, Direction.E, Direction.EW),
            new Point(1, 2, Direction.E, Direction.EW),
            new Point(1, 3, Direction.E, Direction.EW)];
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