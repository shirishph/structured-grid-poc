<template>
  <div id="app">
      <h1>Density Tool</h1>
      <button v-on:click="onReset">Reset</button>
      <button v-on:click="onLogPath">Log Bezier Curve Path</button>
      <canvas
        id="dc"
        width="800"
        height="300"
        v-on:mousedown="onTapDown"
        v-on:mouseup="onTapUp"
        v-on:mousemove="onTapMove"
        style="background-color:lightgrey;display: table;margin-right: auto;margin-left: auto;border: 1px solid gray;">
    </canvas>

  </div>
</template>

<script>
export default {
  name: 'Density Tool',
  data() {
      console.log("data--")
      return {
        vueCanvas: null,
        cp1: {},
        cp2: {},
        dragflag: false,
        dragstartx: 0,
        dragstarty: 0,
      }
  },
  created() {
    console.log("created--");
    this.setDefaults();
  },
  mounted() {
      console.log("mounted--");
      this.vueCanvas = document.getElementById("dc").getContext("2d");
      this.refresh();
  },
  methods: {
    setDefaults() {
        console.log("setDefaults");
        this.PAD_WIDTH = 800;
        this.PAD_HEIGHT = 300;
        this.OFFSET = 10;
        this.TOTAL_X_AXIS_GRADATIONS = 20;
        
        this.START_POINT_X = this.OFFSET;
        this.START_POINT_Y = this.PAD_HEIGHT - (this.OFFSET * 2);
        this.END_POINT_X = this.PAD_WIDTH - (this.OFFSET * 2);
        this.END_POINT_Y = this.PAD_HEIGHT - (this.OFFSET * 2);
        this.CIRCLE_RADIUS = 5;
        this.cp1 = {
            x: this.START_POINT_X + (this.PAD_WIDTH / 4),
            y: this.END_POINT_Y,
            dragging: false
        };
        this.cp2 = {
            x: this.END_POINT_X - (this.PAD_WIDTH / 4),
            y: this.END_POINT_Y,
            dragging: false
        };
    },
    getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
        return {
            x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
            y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
        };
    },
    onLogPath() {
        console.log("onLogPath");
    },
    onReset() {
        console.log("onReset");
        this.setDefaults();
        this.refresh();
    },
    onTapDown(e) {
        console.log("onTapDown");

        if ((e.offsetX > (this.cp1.x - this.CIRCLE_RADIUS)) && 
            (e.offsetX < (this.cp1.x + this.CIRCLE_RADIUS)) && 
            (e.offsetY > (this.cp1.y - this.CIRCLE_RADIUS)) && 
            (e.offsetY < (this.cp1.y + this.CIRCLE_RADIUS))) {
            console.log("drag a circle 1");
            this.dragflag = true;
            this.cp1.dragging = true;
        }

        if ((e.offsetX > (this.cp2.x - this.CIRCLE_RADIUS)) && 
            (e.offsetX < (this.cp2.x + this.CIRCLE_RADIUS)) && 
            (e.offsetY > (this.cp2.y - this.CIRCLE_RADIUS)) && 
            (e.offsetY < (this.cp2.y + this.CIRCLE_RADIUS))) {
            console.log("drag a circle 2");
            this.dragflag = true;
            this.cp2.dragging = true;
        }

        this.dragstartx = e.offsetX;
        this.dragstarty = e.offsetY;
    },
    onTapMove(e) {
        if (this.dragflag) {
            var dx = e.offsetX - this.dragstartx;
            var dy = e.offsetY - this.dragstarty;

            if (this.cp1.dragging) {
                this.cp1.x += dx;
                this.cp1.y += dy;
            }

            if (this.cp2.dragging) {
                this.cp2.x += dx;
                this.cp2.y += dy;
            }

            this.refresh();

            this.dragstartx = e.offsetX;
            this.dragstarty = e.offsetY;
        }
    },
    onTapUp() {
        this.dragflag = false;
        this.cp1.dragging = false;
        this.cp2.dragging = false;
    },
    drawCircle(x, y, colour, radius = this.CIRCLE_RADIUS) {
        this.vueCanvas.beginPath();
        this.vueCanvas.arc(x, y, radius, 0, 2 * Math.PI);
        this.vueCanvas.strokeStyle = colour;
        this.vueCanvas.stroke();
    },
    drawLine(start_x, start_y, end_x, end_y, colour) {
        this.vueCanvas.beginPath();
        this.vueCanvas.moveTo(start_x, start_y);
        this.vueCanvas.lineTo(end_x, end_y);
        this.vueCanvas.strokeStyle = colour;
        this.vueCanvas.stroke();
    },
    refresh() {
        console.log("refresh()")

        this.vueCanvas.lineWidth = 1;
        this.vueCanvas.clearRect(0, 0, this.PAD_WIDTH, this.PAD_HEIGHT);

        this.drawLine(this.START_POINT_X, this.START_POINT_Y, this.END_POINT_X, this.END_POINT_Y, 'black')

        this.drawCircle(this.START_POINT_X, this.START_POINT_Y, 'black');
        this.drawCircle(this.END_POINT_X, this.END_POINT_Y, 'black');

        this.drawCircle(this.cp1.x, this.cp1.y, 'red');
        this.drawCircle(this.cp2.x, this.cp2.y, 'red');

        this.drawLine(this.START_POINT_X, this.START_POINT_Y, this.cp1.x, this.cp1.y, 'red')
        this.drawLine(this.END_POINT_X, this.END_POINT_Y, this.cp2.x, this.cp2.y, 'red')

        this.vueCanvas.beginPath();
        this.vueCanvas.moveTo(this.START_POINT_X, this.START_POINT_Y);
        this.vueCanvas.bezierCurveTo(
            this.cp1.x, this.cp1.y,
            this.cp2.x, this.cp2.y,
            this.END_POINT_X, this.END_POINT_Y
        )
        this.vueCanvas.strokeStyle = 'black';
        this.vueCanvas.stroke();

        for (var i = 0, res = {}; i < this.TOTAL_X_AXIS_GRADATIONS; i++) {
            res = this.getBezierXY(i / this.TOTAL_X_AXIS_GRADATIONS, this.START_POINT_X, this.START_POINT_Y, this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.END_POINT_X, this.END_POINT_Y);
            console.log("@50%", res);
            this.drawCircle(res.x, res.y, 'midnightblue', this.CIRCLE_RADIUS / 2);
            this.drawLine(res.x, res.y, res.x, this.END_POINT_Y, 'green');
            var num = this.START_POINT_Y - res.y;
            var perc = (num * 100) / (this.START_POINT_Y - this.START_POINT_X);
            this.vueCanvas.fillText(perc.toFixed(2), res.x, res.y - 5);
        }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
a {
  color: #42b983;
}
</style>
