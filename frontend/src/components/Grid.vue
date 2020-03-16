<template>
  <div>
    <h1>structured-grid-poc</h1>
    <button v-on:click="onExport">Export</button>
    <button v-on:click="onReset">Reset</button>
    <canvas
        id="c"
        width="500"
        height="500"
        v-on:mousedown="onTapDown"
        v-on:mouseup="onTapUp"
        v-on:mousemove="onTapMove"
        style="background-color:midnightblue;display: table;margin-right: auto;margin-left: auto;border: 1px solid gray;">
    </canvas>
  </div>
</template>

<script>
export default {
  name: 'Grid',
  data() {
      console.log("data--")
      return {
        vueCanvas: null,
        part: {},
        quad_cell_width: 0,
        quad_cell_height: 0,
        quadsList: [],
        dragflag: false,
        dragstartx: 0,
        dragstarty: 0
      }
  },
  created() {
    console.log("created--");

    // Constants init
    this.TEXT_COLUMN_OFFSET = 5;
    this.TEXT_ROW_OFFSET = 10;
    this.VIEWPORT_WIDTH = 500;
    this.VIEWPORT_HEIGHT = 500;
    this.PART_WIDTH = 200;
    this.PART_HEIGHT = 100;
    this.PART_DEFAULT_X = (this.VIEWPORT_WIDTH / 2) - (this.PART_WIDTH / 2);
    this.PART_DEFAULT_Y = (this.VIEWPORT_HEIGHT / 2) - (this.PART_HEIGHT / 2);

    // Reactive var init
    this.part = {
        x: this.PART_DEFAULT_X,
        y: this.PART_DEFAULT_Y,
        width: this.PART_WIDTH,
        height: this.PART_HEIGHT,
        dragging: false
    };
  },
  mounted() {
      console.log("mounted--");
      this.quad_cell_width = this.PART_WIDTH / 8;
      this.quad_cell_height = this.PART_HEIGHT / 5;
      this.vueCanvas = document.getElementById("c").getContext("2d");
      this.computeQuads();
      this.refresh();
  },
  methods: {
    onReset() {
        console.log("onReset");
        this.part.x = this.PART_DEFAULT_X;
        this.part.y = this.PART_DEFAULT_Y;
        this.part.width = this.PART_WIDTH;
        this.part.height = this.PART_HEIGHT;
        this.part.dragging = false;
        this.computeQuads();
        this.refresh();
    },
    onExport() {
        console.log("onExport");
        this.quadsList.forEach((element, index) => {
            console.log(index, JSON.stringify(element))
        });

    },
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

            this.computeQuads();
            this.refresh();

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
            dy = basey - this.quad_cell_height;
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
            dx = basex - this.quad_cell_width;
            dy = basey;
        }

        this.vueCanvas.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
        this.vueCanvas.fillRect(dx, dy, this.quad_cell_width, this.quad_cell_height);
    },
    computeQuads() {
        console.log("computeQuads()")

        var boundingRect = {
            x: this.part.x,
            y: this.part.y,
            width: this.part.width,
            height: this.part.height
        }

        this.quadsList = []

        var cpx = 0;
        var cpy = 0;
        var dir = "east";
        var greenFlag = true;

        do {
            this.quadsList.push({
                boundingRect: boundingRect,
                cpx: cpx,
                cpy: cpy,
                dir: dir
            });
            if (dir == "east") {
                if (cpx < boundingRect.width) {
                    cpx += this.quad_cell_width;
                }
                else {
                    dir = "south";
                }
            }
            else if (dir == "south") {
                if (cpy < boundingRect.height) {
                    cpy += this.quad_cell_height;
                }
                else {
                    dir = "west";
                }
            }
            else if (dir == "west") {
                if (cpx > 0) {
                    cpx -= this.quad_cell_width;
                }
                else {
                    dir = "north";
                }
            }
            else if (dir == "north") {
                if (cpy > 0) {
                    cpy -= this.quad_cell_height;
                }
                else {
                    cpy -= this.quad_cell_height;
                    this.quadsList.push({
                        boundingRect: boundingRect,
                        cpx: cpx,
                        cpy: cpy,
                        dir: dir
                    });
                    greenFlag = false;
                }
            }
        }
        while (greenFlag);
    },
    refresh() {
        console.log("refresh()")

        var boundingRect = {
            x: this.part.x,
            y: this.part.y,
            width: this.part.width,
            height: this.part.height
        }

        this.vueCanvas.lineWidth = 1;
        this.vueCanvas.clearRect(0, 0, this.VIEWPORT_WIDTH, this.VIEWPORT_HEIGHT);

        this.vueCanvas.fillStyle = 'lightgrey';
        this.vueCanvas.beginPath();
        this.vueCanvas.fillRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        this.vueCanvas.stroke();

        this.vueCanvas.fillStyle = 'darkslategrey';
        var row = boundingRect.y;
        this.vueCanvas.fillText("PART DIM, " + "x: " + boundingRect.x + ", y: " + boundingRect.y + ", w: " + boundingRect.width + ", h: " + boundingRect.height, boundingRect.x + this.TEXT_COLUMN_OFFSET, row += this.TEXT_ROW_OFFSET)
        this.vueCanvas.fillText("T QUADS/BASE LAYER: " + this.quadsList.length, boundingRect.x + this.TEXT_COLUMN_OFFSET, row += this.TEXT_ROW_OFFSET)

        this.vueCanvas.globalAlpha = 0.5;
        this.quadsList.forEach(element => {
            this.drawBox(element.boundingRect, element.cpx, element.cpy, element.dir);
        });
        this.vueCanvas.globalAlpha = 1.0;
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
