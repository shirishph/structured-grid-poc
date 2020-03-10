<template>
  <div>
    <h1>GRID</h1>
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
            x: 300,
            y: 300,
            width: 100,
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
    draw() {
      this.vueCanvas.lineWidth = 1;
      this.vueCanvas.clearRect(0, 0, 700, 700);

      this.vueCanvas.beginPath();
      this.vueCanvas.rect(this.part.x, this.part.y, this.part.width, this.part.height);
      this.vueCanvas.stroke();
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
