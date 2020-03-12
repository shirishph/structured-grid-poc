<template>
  <div>
    <h1>structured-grid-poc</h1>
    <canvas
        id="c"
        height="700"
        width="700"
        v-on:mousedown="onTapDown"
        v-on:mouseup="onTapUp"
        v-on:mousemove="onTapMove"
        style="background-color:lightblue;display: table;margin-right: auto;margin-left: auto;border: 1px solid gray;">
    </canvas>
  </div>
</template>

<script>
export default {
  name: 'Grid',
  data() {
      return {
        vueCanvas: null,
        part: {
            x: 250,
            y: 300,
            width: 200,
            height: 100,
            dragging: false
        },
        dragflag: false,
        dragstartx: 0,
        dragstarty: 0
      }
  },
  mounted() {
      console.log("mounted--")
      var c = document.getElementById("c");
      var ctx = c.getContext("2d");    
      this.vueCanvas = ctx;
      this.draw();
  },
  methods: {
    onTapDown(e) {
        if((e.offsetX > this.part.x) && (e.offsetX < (this.part.x + this.part.width)) && (e.offsetY > this.part.y) && (e.offsetY < (this.part.y + this.part.height))) {
            this.dragflag = true;
            this.part.dragging = true;
        }
        this.dragstartx = e.offsetX;
        this.dragstarty = e.offsetY;
    },
    onTapMove(e) {
        if (this.dragflag) {
            var dx = e.offsetX - this.dragstartx;
            var dy = e.offsetY - this.dragstarty;

            if (this.part.dragging) {
                this.part.x += dx;
                this.part.y += dy;
            }

            this.draw();

            this.dragstartx = e.offsetX;
            this.dragstarty = e.offsetY;
        }
    },
    onTapUp() {
        this.dragflag = false;
        this.part.dragging = false;
    },
    drawBox(boundingRect, cpx, cpy, dir) {
        var basex = boundingRect.x + cpx;
        var basey = boundingRect.y + cpy;

        var dx = 0;
        var dy = 0;

        if (dir == "east") {
            dx = basex;
            dy = basey - 20;
        }
        else if (dir == "south") {
            dx = basex;
            dy = basey;
        }
        else if (dir == "west") {
            dx = basex;
            dy = basey;
        }
        else if (dir == "north") {
            dx = basex - 25;
            dy = basey;
        }

        this.vueCanvas.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.vueCanvas.fillRect(dx, dy, 25, 20);
    },
    draw() {
        console.log("draw()")

        var boundingRect = {
            x: this.part.x,
            y: this.part.y,
            width: this.part.width,
            height: this.part.height
        }
        var cpx = 0;
        var cpy = 0;
        var dir = "east";
        var greenFlag = true;

        this.vueCanvas.lineWidth = 1;
        this.vueCanvas.clearRect(0, 0, 700, 700);

        this.vueCanvas.beginPath();
        this.vueCanvas.rect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        this.vueCanvas.stroke();

        do {
            this.drawBox(boundingRect, cpx, cpy, dir);
            if (dir == "east") {
                if (cpx < boundingRect.width) {
                    cpx += 25;
                }
                else {
                    dir = "south";
                }
            }
            else if (dir == "south") {
                if (cpy < boundingRect.height) {
                    cpy += 20;
                }
                else {
                    dir = "west";
                }
            }
            else if (dir == "west") {
                if (cpx > 0) {
                    cpx -= 25;
                }
                else {
                    dir = "north";
                }
            }
            else if (dir == "north") {
                if (cpy > 0) {
                    cpy -= 20;
                }
                else {
                    cpy -= 20;
                    this.drawBox(boundingRect, cpx, cpy, dir);
                    greenFlag = false;
                }
            }
        }
        while (greenFlag);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}
</style>
