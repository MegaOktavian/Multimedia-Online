var canvasWidth = 1300;
var canvasHeight = 530;
var canvas = document.getElementById('canvas');

window.onresize = function() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
};

canvas.width = canvasWidth;
canvas.height = canvasHeight;

var ctx = canvas.getContext('2d'); 

var V = 0.2;
var A = 0.02;
var C = 1;

var W = 1;
var H = 1;

var MAX_VX = 1;
var MAX_VY = 1;

var ALPHA = 100;

var COUNT = 0;
var GRAVITY = 0.05;
var POWER = 60;
var POWER_RADIUS = 20;

var PICTURE_DISTANCE = 30;

var Particle = function(x, y, picture) {
    this.x = x;
    this.y = y;

    this.ax = 0;//(Math.random() - 0.5) * A / 2;
    this.ay = 0;//-A - (Math.random() - 0.5) * A;

    this.vx = 0; //(Math.random() - 0.5) * V / 2;
    this.vy = 0; // - A -  (Math.random() - 0.5) * V;            

    this.ar = (Math.random() - 0.5);
    this.ag = (Math.random() - 0.5);
    this.ab = (Math.random() - 0.5);

    this.r = 255 * Math.random();
    this.g = 255 * Math.random();
    this.b = 255 * Math.random();

    this.picture = picture;
    this.stop = false;
};

Particle.prototype.move = function() {
    if (this.stop) {
        return;
    }

    this.prevPrevX = this.prevX;
    this.prevPrevY = this.prevY;

    this.prevX = this.x;
    this.prevY = this.y;

    this.vx += this.ax;
    this.vy += this.ay - (this.picture ? 0 : GRAVITY);

    this.x += this.vx;
    this.y += this.vy;

    if (this.gettingToStop) {
        this.moveTo(this.originX, this.originY);
        return;
    }

    this.r += this.ar;
    this.g += this.ag;
    this.b += this.ab;
};

Particle.prototype.moveTo = function(x, y) {
    this.stop = false;
    var angle = Math.atan2(y - this.y, x - this.x);

    this.vx = 1;
    this.vy = 1;

    var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    var a = Math.sqrt(this.ax * this.ax + this.ay * this.ay);

    this.vx = v * Math.cos(angle);
    this.vy = v * Math.sin(angle);

    this.ax = a * Math.cos(angle);
    this.ay = a * Math.sin(angle) + (this.picture ? 0 : GRAVITY);
};

Particle.prototype.powerTo = function(x, y) {
    var angle = Math.atan2(y - this.y, x - this.x);

    var distance = Math.sqrt((y - this.y) * (y - this.y) + (x - this.x) * (x - this.x));

    if (distance > POWER_RADIUS) {
        return;
    }

    var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    var a = Math.sqrt(this.ax * this.ax + this.ay * this.ay);

    this.vx = -v * Math.cos(angle) * ( POWER / distance);
    this.vy = -v * Math.sin(angle) * ( POWER / distance);

    this.ax = -a * Math.cos(angle) * ( POWER / distance);
    this.ay = -a * Math.sin(angle) * ( POWER / distance);        
};

Particle.prototype.checkCollision = function() {
    if (this.stop) {
        return;
    }

    var invert = function(v, a, c) {
        this[v] = -this[v] * Math.random() / 2;
        if (this[a] === 0) {
            this[a] = Math.random() * c * 2;
            return;
        }
        this[a] = this[a] / Math.abs(this[a]) * (Math.random() - 0.5) * c * 2;
    }.bind(this);

    var invertColor = function(a, c) { 
        if (this[a] === 0) {
            this[a] = Math.random() * c;
            return;
        }
        this[a] = -this[a] / Math.abs(this[a]) * c * Math.random();   
    }.bind(this);

    if (this.x > canvasWidth) {
        this.x = canvasWidth;
        invert('vx', 'ax', A);
    } else if (this.x < 0) {
        this.x = 0;
        invert('vx', 'ax', A);
    }

    if (this.y > canvasHeight) {
        this.y = canvasHeight;
        invert('vy', 'ay', A);
    } else if (this.y < 0) {
        this.y = 0;
        invert('vy', 'ay', A);
    }

    if (this.picture) {
        var distance = Math.sqrt((this.x - this.originX) * (this.x - this.originX) + (this.y - this.originY) * (this.y - this.originY));

        if (distance < PICTURE_DISTANCE) {
            this.ax = 0;
            this.ay = 0;
            this.x = this.originX;
            this.y = this.originY;
            this.r = this.originR;
            this.g = this.originG;
            this.b = this.originB;
            this.ar = 0;
            this.ag = 0;
            this.ab = 0;
            this.stop = true;
        }
    }

    if (this.r > 255) {
        this.r = 255;
        invertColor('ar', C);
    } else if (this.r < 0) {
        this.r = 0;
        invertColor('ar', C);
    }

    if (this.g > 255) {
        this.g = 255;
        invertColor('ag', C);
    } else if (this.g < 0) {
        this.g = 0;
        invertColor('ag', C);
    }

    if (this.b > 255) {
        this.b = 255;
        invertColor('ab', C);
    } else if (this.b < 0) {
        this.b = 0;
        invertColor('ab', C);
    }
};

var Field = function() {
    this.particles = [];
};

Field.prototype.render = function() {
    this.particles.forEach(function(particle) {
        ctx.fillStyle = "rgba("+Math.round(particle.r)+","+Math.round(particle.g)+","+Math.round(particle.b)+",1)";
        ctx.fillRect(particle.x, canvasHeight - particle.y, 2, 2);
    });
};

Field.prototype.renderLine = function(from, to) {
    if (!this.particles[from] || !this.particles[to]) {
        return;
    }
    ctx.moveTo(this.particles[from].x, this.particles[from].y);
    ctx.lineTo(this.particles[to].x, this.particles[to].y);
};

Field.prototype.move = function() {
    this.particles.forEach(function(particle) {
        particle.move();
    });
};

Field.prototype.checkCollision = function() {
    this.particles.forEach(function(particle) {
        particle.checkCollision();
    });
};

Field.prototype.moveTo = function(x, y) {
    this.particles.forEach(function(particle) {
        particle.moveTo(x, y);
    });
};

Field.prototype.powerTo = function(x, y) {
    this.particles.forEach(function(particle) {
        particle.powerTo(x, y);
    });
};

Field.prototype.addParticles = function(particles) {
    this.particles = this.particles.concat(particles);
};

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
};

var field = new Field();

canvas.onclick = function(event) {
    field.moveTo(event.clientX, canvasHeight - event.clientY);
};

function update() {
    ctx.fillStyle = "rgba(0,0,0," + (ALPHA / 255) + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    field.move();
    field.checkCollision();
    field.render();

    requestAnimFrame(update);
};

var particles = [];

var particle_generate_by_image = function() {
    var img = document.createElement('img');
    img.crossOrigin = "Anonymous";
    img.src = 'img/butterfly.png';

    img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        for (var i = 0; i < img.width; i += 2) {
            for (var j = 0; j < img.height; j += 2) {
                var particle = new Particle(i + (canvasWidth - img.width) / 2, img.height - j + (canvasHeight - img.height) / 2);

                var pixelData = ctx.getImageData(i, j, 1, 1).data;

                if (pixelData[0] < 10 && pixelData[1] < 10 && pixelData[2] < 10) {
                    continue;
                }

                particle.vx = (Math.random() - 0.5) * V;
                particle.vy = 0;
                particle.ax = (Math.random() - 0.5) * A;
                particle.ay = 0;

                particle.originX = i + Math.round((canvasWidth - img.width) / 2);
                particle.originY = img.height - j + Math.round((canvasHeight - img.height) / 2);

                particle.stop = true;

                particle.r = pixelData[0];
                particle.g = pixelData[1];
                particle.b = pixelData[2];

                (function(particle, i, j) {
                    particle.stop = true; 
                    particle.ar = 0;
                    particle.ag = 0;
                    particle.ab = 0;

                    setTimeout( function() {
                        particle.stop = false;

                        particle.ar = Math.random();
                        particle.ag = Math.random();
                        particle.ab = Math.random();

                    }, Math.round(Math.random() * 1000 + 1000));

                    setTimeout(function() {
                        particle.picture = true;

                        particle.originX = i + Math.round((canvasWidth - img.width) / 2);
                        particle.originY = img.height - j + Math.round((canvasHeight - img.height) / 2); 

                        particle.moveTo(particle.originX, particle.originY); 
                    }, Math.random() * 2000 + 8000);
                }(particle, i, j));

                particle.originR = pixelData[0];
                particle.originG = pixelData[1];
                particle.originB = pixelData[2];

                particles.push(particle);
            }
        }

        field.addParticles(particles);
        update();
    };
};

window.onload = function () {
    particle_generate_by_image();

    var file = document.getElementById("data");
    var audio = document.getElementById("audio");
    let latar1 = new Audio();
    latar1.src = "audio/latar uas.mp3";
    latar1.play();
    
    file.onchange = function() {
      var files = this.files;
      audio.src = URL.createObjectURL(files[0]);
      audio.load();
      audio.play();
      var context = new AudioContext();
      var src = context.createMediaElementSource(audio);
      var an = context.createAnalyser();

      //pengaturan analyser
      src.connect(an);
      an.connect(context.destination);
      an.fftSize = 256;

      //pengaturan buffer
      var bufferLength = an.frequencyBinCount;
      console.log(bufferLength);

      //pengaturan array data
      var dataArray = new Uint8Array(bufferLength);

      //pengaturan bar musik
      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;
      var barWidth = (WIDTH / bufferLength) * 1.5;
      var barHeight;

      function renderFrame() {
        requestAnimationFrame(renderFrame);
        x = 0;
        an.getByteFrequencyData(dataArray);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        for (var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i]*2;
          ctx.fillStyle = "#8B0000";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
          x += barWidth + 0.5;
        }
      }
      //memainkan musik
      audio.play();
      renderFrame();
    };
};