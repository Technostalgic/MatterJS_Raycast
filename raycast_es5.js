"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

///
///				code by Isaiah Smith
///		technostalgic.itch.io  |  @technostalgicGM
///
///						repo:
///	https://github.com/Technostalgic/MatterJS_Raycast.git
///
//raycast functionality integrated with matter.js since there 
//is no built-in method for raycasting that returns the ray's
//intersection points
//function 'raycast' - returns an array of 'raycol' objects
//param 'bodies' - bodies to check collision with; passed 
//	through 'Matter.Query.ray()'
//param 'start' - start point of raycast
//param 'end' - end point of raycast
//param 'sort' - whether or not the ray collisions should be
//	sorted based on distance from the origin
function raycast(bodies, start, end) {
  var sort = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  //convert the start & end parameters to my custom
  //'vec2' object type
  start = vec2.fromOther(start);
  end = vec2.fromOther(end); //The bodies that the raycast will be tested against
  //are queried and stored in the variable 'query'.
  //This uses the built-in raycast method which takes
  //advantage of the broad-phase collision optomizations
  //instead of iterating through each body in the list

  var query = Matter.Query.ray(bodies, start, end); //'cols': the array that will contain the ray 
  //collision information

  var cols = []; //'raytest': the ray object that will be tested for
  //collision against the bodies

  var raytest = new ray(start, end); //Next, since all the bodies that the ray collides with
  //have already been queried, we iterate through each
  //one to see where the ray intersects with the body
  //and gather other information

  for (var i = query.length - 1; i >= 0; i--) {
    var bcols = ray.bodyCollisions(raytest, query[i].body);

    for (var k = bcols.length - 1; k >= 0; k--) {
      cols.push(bcols[k]);
    }
  } //if desired, we then sort the collisions based on the
  //distance from the ray's start


  if (sort) cols.sort(function (a, b) {
    return a.point.distance(start) - b.point.distance(start);
  });
  return cols;
} //data type that contains information about an intersection 
//between a ray and a body


var raycol = //initailizes a 'raycol' object with the given data
//param 'body' - stores the body that the ray has 
//	collided with
//param 'point' - stores the collision point
//param 'normal' - stores the normal of the edge that
//	the ray collides with
//param 'verts' - stores the vertices of the edge that
//	the ray collides with
function raycol(body, point, normal, verts) {
  _classCallCheck(this, raycol);

  this.body = body;
  this.point = point;
  this.normal = normal;
  this.verts = verts;
}; //data type that contains information and methods for a 
//ray object


var ray =
/*#__PURE__*/
function () {
  //initializes a ray instance with the given parameters
  //param 'start' - the starting point of the ray
  //param 'end' - the ending point of the ray
  function ray(start, end) {
    _classCallCheck(this, ray);

    this.start = start;
    this.end = end;
  }

  _createClass(ray, [{
    key: "yValueAt",
    value: function yValueAt(x) {
      //returns the y value on the ray at the specified x
      //slope-intercept form:
      //y = m * x + b
      return this.offsetY + this.slope * x;
    }
  }, {
    key: "xValueAt",
    value: function xValueAt(y) {
      //returns the x value on the ray at the specified y
      //slope-intercept form:
      //x = (y - b) / m
      return (y - this.offsetY) / this.slope;
    }
  }, {
    key: "pointInBounds",
    value: function pointInBounds(point) {
      //checks to see if the specified point is within
      //the ray's bounding box (inclusive)
      var minX = Math.min(this.start.x, this.end.x);
      var maxX = Math.max(this.start.x, this.end.x);
      var minY = Math.min(this.start.y, this.end.y);
      var maxY = Math.max(this.start.y, this.end.y);
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
    }
  }, {
    key: "calculateNormal",
    value: function calculateNormal(ref) {
      //calulates the normal based on a specified
      //reference point
      var dif = this.difference; //gets the two possible normals as points that lie
      //perpendicular to the ray

      var norm1 = dif.normalized().rotate(Math.PI / 2);
      var norm2 = dif.normalized().rotate(Math.PI / -2); //returns the normal that is closer to the provided
      //reference point

      if (this.start.plus(norm1).distance(ref) < this.start.plus(norm2).distance(ref)) return norm1;
      return norm2;
    }
  }, {
    key: "difference",
    get: function get() {
      //pretty self explanitory
      return this.end.minus(this.start);
    }
  }, {
    key: "slope",
    get: function get() {
      var dif = this.difference;
      return dif.y / dif.x;
    }
  }, {
    key: "offsetY",
    get: function get() {
      //the y-offset at x = 0, in slope-intercept form:
      //b = y - m * x
      //offsetY = start.y - slope * start.x
      return this.start.y - this.slope * this.start.x;
    }
  }, {
    key: "isHorizontal",
    get: function get() {
      return compareNum(this.start.y, this.end.y);
    }
  }, {
    key: "isVertical",
    get: function get() {
      return compareNum(this.start.x, this.end.x);
    }
  }], [{
    key: "intersect",
    value: function intersect(rayA, rayB) {
      //returns the intersection point between two rays
      //null if no intersection
      //conditional checks for axis aligned rays
      if (rayA.isVertical && rayB.isVertical) return null;
      if (rayA.isVertical) return new vec2(rayA.start.x, rayB.yValueAt(rayA.start.x));
      if (rayB.isVertical) return new vec2(rayB.start.x, rayA.yValueAt(rayB.start.x));
      if (compareNum(rayA.slope, rayB.slope)) return null;
      if (rayA.isHorizontal) return new vec2(rayB.xValueAt(rayA.start.y), rayA.start.y);
      if (rayB.isHorizontal) return new vec2(rayA.xValueAt(rayB.start.y), rayB.start.y); //slope intercept form:
      //y1 = m2 * x + b2; where y1 = m1 * x + b1:
      //m1 * x + b1 = m2 * x + b2:
      //x = (b2 - b1) / (m1 - m2)

      var x = (rayB.offsetY - rayA.offsetY) / (rayA.slope - rayB.slope);
      return new vec2(x, rayA.yValueAt(x));
    }
  }, {
    key: "collisionPoint",
    value: function collisionPoint(rayA, rayB) {
      //returns the collision point of two rays
      //null if no collision
      var intersection = ray.intersect(rayA, rayB);
      if (!intersection) return null;
      if (!rayA.pointInBounds(intersection)) return null;
      if (!rayB.pointInBounds(intersection)) return null;
      return intersection;
    }
  }, {
    key: "bodyEdges",
    value: function bodyEdges(body) {
      //returns all of the edges of a body in the
      //form of an array of ray objects
      var r = [];

      for (var i = body.parts.length - 1; i >= 0; i--) {
        for (var k = body.parts[i].vertices.length - 1; k >= 0; k--) {
          var k2 = k + 1;
          if (k2 >= body.parts[i].vertices.length) k2 = 0;
          var tray = new ray(vec2.fromOther(body.parts[i].vertices[k]), vec2.fromOther(body.parts[i].vertices[k2])); //stores the vertices inside the edge
          //ray for future reference

          tray.verts = [body.parts[i].vertices[k], body.parts[i].vertices[k2]];
          r.push(tray);
        }
      }

      return r;
    }
  }, {
    key: "bodyCollisions",
    value: function bodyCollisions(rayA, body) {
      //returns all the collisions between a specified ray
      //and body in the form of an array of 'raycol' objects
      var r = []; //gets the edge rays from the body

      var edges = ray.bodyEdges(body); //iterates through each edge and tests for collision
      //with 'rayA'

      for (var i = edges.length - 1; i >= 0; i--) {
        //gets the collision point
        var colpoint = ray.collisionPoint(rayA, edges[i]); //if there is no collision, then go to next edge

        if (!colpoint) continue; //calculates the edge's normal

        var normal = edges[i].calculateNormal(rayA.start); //adds the ray collision to the return array

        r.push(new raycol(body, colpoint, normal, edges[i].verts));
      }

      return r;
    }
  }]);

  return ray;
}(); //in order to avoid miscalculations due to floating point
//errors
//example:
//	var m = 6; m -= 1; m -= 3; m += 4
//	now 'm' probably equals 6.0000000008361 or something stupid


function compareNum(a, b) {
  var leniency = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.00001;
  return Math.abs(b - a) <= leniency;
} //
//included external dependencies:
//
//2d vector data type; contains information and methods for
//2-dimensional vectors


var vec2 =
/*#__PURE__*/
function () {
  //initailizes a 'vec2' object with specified values
  function vec2() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;

    _classCallCheck(this, vec2);

    this.x = x;
    this.y = y;
  }

  _createClass(vec2, [{
    key: "normalized",
    value: function normalized() {
      var magnitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      //returns a vector 2 with the same direction as this but
      //with a specified magnitude
      return this.multiply(magnitude / this.distance());
    }
  }, {
    key: "multiply",
    value: function multiply(factor) {
      //returns this multiplied by a specified factor    
      return new vec2(this.x * factor, this.y * factor);
    }
  }, {
    key: "plus",
    value: function plus(vec) {
      //returns the result of this added to another
      //specified 'vec2' object
      return new vec2(this.x + vec.x, this.y + vec.y);
    }
  }, {
    key: "minus",
    value: function minus(vec) {
      //returns the result of this subtracted by another
      //specified 'vec2' object
      return this.plus(vec.inverted);
    }
  }, {
    key: "rotate",
    value: function rotate(rot) {
      //rotates the vector by the specified angle
      var ang = this.direction;
      var mag = this.distance();
      ang += rot;
      return vec2.fromAng(ang, mag);
    }
  }, {
    key: "toPhysVector",
    value: function toPhysVector() {
      //converts this to a vector compatible with the
      //matter.js physics engine
      return Matter.Vector.create(this.x, this.y);
    }
  }, {
    key: "distance",
    value: function distance() {
      var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new vec2();
      //returns the distance between this and a specified
      //'vec2' object
      var d = Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
      return d;
    }
  }, {
    key: "clone",
    value: function clone() {
      //returns a new instance of a 'vec2' object with the
      //same value
      return new vec2(this.x, this.y);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "vector<" + this.x + ", " + this.y + ">";
    }
  }, {
    key: "inverted",
    get: function get() {
      //returns the opposite of this vector
      return this.multiply(-1);
    }
  }, {
    key: "direction",
    get: function get() {
      //returns the angle this vector is pointing in radians
      return Math.atan2(this.y, this.x);
    }
  }], [{
    key: "fromAng",
    value: function fromAng(angle) {
      var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      //returns a vector which points in the specified angle
      //and has the specified magnitude
      return new vec2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
  }, {
    key: "fromOther",
    value: function fromOther(vector) {
      //converts other data types that contain 'x' and 'y'
      //properties to a 'vec2' object type
      return new vec2(vector.x, vector.y);
    }
  }]);

  return vec2;
}();