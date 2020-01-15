   
"use strict";
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1350;
canvas.height = 430;


// Global Variables
let	points = [];
const mouse = {
	x: innerWidth / 2,
	y: innerHeight / 2 
};


// Event Listeners
addEventListener("mousemove", function(event) {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
});

addEventListener("resize", function() {
	canvas.width = innerWidth;	
	canvas.height = innerHeight;
	points = [];
	initializePoints();
});


// Objects
function Point(x, y, radius, color) {
	this.x = x;
	this.y = y;
	this.dx = (Math.random() - 0.5) * 7
	this.dy = (Math.random() - 0.5) * 7;
	this.radius = radius;
	this.ringRadius = 0;
	this.color = color;

	this.update = function() {
		// Bounce off left and right of window
		if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}

		// Bounce off top and bottom of window
		if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
			this.dy = -this.dy;
		}

		this.x += this.dx;
		this.y += this.dy;
		this.draw();
	};
}

Point.prototype.draw = function() {
  // Draw point
  c.beginPath();
  c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);	
  c.fillStyle = this.color;
  c.fill();
  c.closePath();

  // Draw ring around point
  c.beginPath();
  c.arc(this.x, this.y, Math.abs(this.ringRadius), 0, Math.PI * 2, false);
  c.strokeStyle = "white";
  c.stroke();
  c.closePath();
};


function isCounterClockwise(P0, P1, P2) {
    return ( (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y) );
}


// Implementation
function initializePoints() {
	const radius = 3;
	for (let i = 0; i < 30; i++) {
	    points.push(new Point(
	    	Math.random() * (canvas.width - radius * 2) + radius,
	    	Math.random() * (canvas.height - radius * 2) + radius,
	    	radius,
	    	"#6ea3f1"
	    ));
	}
}

function animate() {

	// Remove or comment this to stop the animation and inspect points without movement
	requestAnimationFrame(animate);
	c.clearRect(0, 0, canvas.width, canvas.height);


	// Sort points by greatest y value to least y value
	points.sort(function(a, b) {
		return b.y - a.y;
	});


	// Remove first value from sorted array so we get the
	// highest y coordinate as our start point
	const startPoint = points.shift();


	// Sort the rest of the coordinates in order of smallest
	// to largest angle relative to the start point 
	points.sort(function(a, b) {
		const tanA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x);
		const tanB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x);
		return tanB - tanA;
	});


	// Add original start point back to its position in front of array
	points.unshift(startPoint);


	// Create an array to store any points that exist on the convex hull
	let convexHullPoints = [];


	// First two of the sorted points will always be on the convex hull
	convexHullPoints.push(points[0]);
	convexHullPoints.push(points[1]);


	// Loop through the rest of the points to see if they exist on the convex hull
	for (let i = 2; i < points.length; i++) {
		while ( isCounterClockwise(convexHullPoints[convexHullPoints.length - 2], convexHullPoints[convexHullPoints.length - 1], points[i]) > 0) {
	      convexHullPoints.pop();
	    }

	    convexHullPoints.push(points[i]);
	}

	convexHullPoints.push(points[0]);


	// Now that we have a filtered set of points on the convex 
	// hull, we can draw lines that connect them

	for (let i = 0; i < convexHullPoints.length; i++) {

		// Slowly increase ring radius for smooth transition
		const desiredRingRadius = convexHullPoints[i].radius + 5;
		convexHullPoints[i].ringRadius += (desiredRingRadius - convexHullPoints[i].ringRadius) * 0.15;

	    if (i + 1 >= convexHullPoints.length) continue;

	    c.save();
	    c.beginPath();
	    c.moveTo(convexHullPoints[i].x, convexHullPoints[i].y);
	    c.lineTo(convexHullPoints[i + 1].x, convexHullPoints[i + 1].y);
	    c.strokeStyle = "#6ea3f1";
	    c.lineWidth = 3;
	    c.stroke();
	    c.closePath();
	    c.restore();

	    convexHullPoints[i].color = "white";

	}


	// Animate and create all points
	for (let i = 0; i < points.length; i++) {

	    points[i].update();

	    // If point is not in the convex hull array, change color and decrease ring size
	    if (!convexHullPoints.includes(points[i])) {
		    points[i].color = "#6ea3f1";

		    if (points[i].ringRadius > 0) {
			    points[i].ringRadius -= 0.25;
			}
	    }

	    if (i + 1 >= points.length) continue;
	}
}

initializePoints();
animate();