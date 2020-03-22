<template>
  <div>
    <p>Drafting Table</p>
    <div>
        <div>
            <input type="checkbox" v-model="showStars" @change="check()">
            <span>Show Stars</span>
        </div>
        <div>
            <input type="checkbox" v-model="fillColour" @change="check()">
            <span>Fill cell with Colour</span>
        </div>
    </div>
    <canvas
        id="c"
        width="950"
        height="950"
        v-on:mousedown="onTapDown"
        v-on:mouseup="onTapUp"
        v-on:mousemove="onTapMove"
        style="background-color:ghostwhite;display: table;margin-right: auto;margin-left: auto;border: 2px dotted grey;">
    </canvas>
  </div>
</template>

<script>
export default {
    name: 'DraftingTable',
    data() {
        console.log("-data-");
        return {
            options: [],
            showStars: false,
            fillColour: false,
            canvas: null,
            part: {},
            draggables: [],
            dragflag: false,
            dragstartx: 0,
            dragstarty: 0,
            quadsList: [],
            hgradations: [],
            vgradations: []
        }
    },
    created() {
        console.log("-created-");
        this.reset();
    },
    mounted() {
        console.log("-mounted-");
        this.canvas = document.getElementById("c").getContext("2d");
        this.computeQuads();
        this.refresh();
    },
    methods: {
        check() {
            this.computeQuads();
            this.refresh();
        },
        reset() {
            this.CIRCLE_RADIUS = 7;
            this.TOTAL_GRADATIONS = 10;
            this.TEXT_COLUMN_OFFSET = 5;
            this.TEXT_ROW_OFFSET = 10;

            this.VIEWPORT_WIDTH = 950;
            this.VIEWPORT_HEIGHT = 950;
            this.PART_WIDTH = 500;
            this.PART_HEIGHT = 300;
            this.PART_DEFAULT_X = (this.VIEWPORT_WIDTH / 2) - (this.PART_WIDTH / 2);
            this.PART_DEFAULT_Y = (this.VIEWPORT_HEIGHT / 2) - (this.PART_HEIGHT / 2);

            this.part = {
                x: this.PART_DEFAULT_X,
                y: this.PART_DEFAULT_Y,
                width: this.PART_WIDTH,
                height: this.PART_HEIGHT
            };
            this.draggables.push({obj: this.part, type: "square", dragging: false});

            this.north_cp1 = {
                x: this.part.x + (this.PART_WIDTH / 4),
                y: this.part.y
            };
            this.draggables.push({obj: this.north_cp1, type: "circle", dragging: false});

            this.north_cp2 = {
                x: (this.part.x + this.part.width) - (this.PART_WIDTH / 4),
                y: this.part.y
            };
            this.draggables.push({obj: this.north_cp2, type: "circle", dragging: false});

            this.east_cp1 = {
                x: this.part.x + this.PART_WIDTH,
                y: this.part.y + (this.PART_HEIGHT / 4)
            };
            this.draggables.push({obj: this.east_cp1, type: "circle", dragging: false});

            this.east_cp2 = {
                x: this.part.x + this.PART_WIDTH,
                y: (this.part.y + this.PART_HEIGHT) - (this.PART_HEIGHT / 4)
            };
            this.draggables.push({obj: this.east_cp2, type: "circle", dragging: false});

        },
        onTapDown(e) {
            for (var i = 0; i < this.draggables.length; i++) {
                var element = this.draggables[i];

                if (element.type == "circle") {
                    if ((e.offsetX > (element.obj.x - this.CIRCLE_RADIUS)) && 
                        (e.offsetX < (element.obj.x + this.CIRCLE_RADIUS)) && 
                        (e.offsetY > (element.obj.y - this.CIRCLE_RADIUS)) && 
                        (e.offsetY < (element.obj.y + this.CIRCLE_RADIUS))) {
                        this.dragflag = true;
                        this.draggables[i].dragging = true;
                        break;
                    }
                }
                else if (element.type == "square") {
                    if((e.offsetX > element.obj.x) && 
                        (e.offsetX < (element.obj.x + element.obj.width)) && 
                        (e.offsetY > element.obj.y) && 
                        (e.offsetY < (element.obj.y + element.obj.height))) {
                        this.dragflag = true;
                        this.draggables[i].dragging = true;
                        break;
                    }
                }
            }

            this.dragstartx = e.offsetX;
            this.dragstarty = e.offsetY;
        },
        onTapMove(e) {
            if (this.dragflag) {
                var dx = e.offsetX - this.dragstartx;
                var dy = e.offsetY - this.dragstarty;

                for (var i = 0; i < this.draggables.length; i++) {
                    if(this.draggables[i].dragging) {
                        this.draggables[i].obj.x += dx;
                        this.draggables[i].obj.y += dy;

                        this.computeQuads();
                        this.refresh();
                    }
                }

                this.dragstartx = e.offsetX;
                this.dragstarty = e.offsetY;
            }
        },
        onTapUp() {
            this.dragflag = false;

            for (var i = 0; i < this.draggables.length; i++) {
                this.draggables[i].dragging = false;
            }
        },
        getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
            return {
                x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
                y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
            };
        },
        drawCircle(x, y, colour, radius = this.CIRCLE_RADIUS) {
            this.canvas.beginPath();
            this.canvas.arc(x, y, radius, 0, 2 * Math.PI);
            this.canvas.strokeStyle = colour;
            this.canvas.stroke();
        },
        drawStar(cx, cy, spikes, outerRadius, innerRadius) {
            var rot = Math.PI / 2 * 3;
            var x = cx;
            var y = cy;
            var step = Math.PI / spikes;

            this.canvas.strokeSyle = "#000";
            this.canvas.beginPath();
            this.canvas.moveTo(cx, cy - outerRadius)
            for (var i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                this.canvas.lineTo(x, y)
                rot += step

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                this.canvas.lineTo(x, y)
                rot += step
            }
            this.canvas.lineTo(cx, cy - outerRadius)
            this.canvas.closePath();
            this.canvas.lineWidth=5;
            this.canvas.strokeStyle='blue';
            this.canvas.stroke();
            this.canvas.fillStyle='skyblue';
            this.canvas.fill();
        },
        drawLine(start_x, start_y, end_x, end_y, colour) {
            this.canvas.beginPath();
            this.canvas.moveTo(start_x, start_y);
            this.canvas.lineTo(end_x, end_y);
            this.canvas.strokeStyle = colour;
            this.canvas.stroke();
        },
        computeQuads() {
            console.log("computeQuads()")

            var start_x = this.part.x;
            var start_y = this.part.y;
            var end_x = this.part.x + this.part.width;
            var end_y = this.part.y;

            var i = 0;
            var res = {};
            this.hgradations = []
            for (i = 0; i < this.TOTAL_GRADATIONS; i++) {
                res = this.getBezierXY(
                    i / this.TOTAL_GRADATIONS,
                    start_x,
                    start_y,
                    this.north_cp1.x,
                    this.north_cp1.y,
                    this.north_cp2.x,
                    this.north_cp2.y,
                    end_x,
                    end_y);
                if(i > 0) {
                    this.hgradations.push(res.x);
                }
            }

            start_x = this.part.x + this.part.width;
            start_y = this.part.y;
            end_x = this.part.x + this.part.width;
            end_y = this.part.y + this.part.height;

            this.vgradations = []
            for (i = 0; i < this.TOTAL_GRADATIONS; i++) {
                res = this.getBezierXY(
                    i / this.TOTAL_GRADATIONS,
                    start_x,
                    start_y,
                    this.east_cp1.x,
                    this.east_cp1.y,
                    this.east_cp2.x,
                    this.east_cp2.y,
                    end_x,
                    end_y);
                if(i > 0) {
                    this.vgradations.push(res.y);
                }
            }

            console.log("hgradations", this.hgradations);
            console.log("vgradations", this.vgradations);

            this.quadsList = []
            var cell_height = this.part.height / 10;
            console.log("cell_height", cell_height);

            start_x = this.part.x;
            for (i = 0; i < this.hgradations.length; i++) {
                this.quadsList.push({
                    x: start_x,
                    y: this.part.y - cell_height,
                    width: this.hgradations[i] - start_x,
                    height: cell_height
                });
                start_x = this.hgradations[i];
            }
            this.quadsList.push({
                x: start_x,
                y: this.part.y - cell_height,
                width: (this.part.x + this.part.width) - start_x,
                height: cell_height
            });

            start_y = this.part.y;
            for (i = 0; i < this.vgradations.length; i++) {
                this.quadsList.push({
                    x: this.part.x + this.part.width,
                    y: start_y,
                    width: cell_height,
                    height: this.vgradations[i] - start_y
                });
                start_y = this.vgradations[i];
            }
            this.quadsList.push({
                x: this.part.x + this.part.width,
                y: start_y,
                width: cell_height,
                height: (this.part.y + this.part.height) - start_y
            });
        },
        refresh() {
            console.log("-refresh-");

            this.canvas.lineWidth = 1;
            this.canvas.clearRect(0, 0, this.VIEWPORT_WIDTH, this.VIEWPORT_HEIGHT);

            this.canvas.fillStyle = 'lightgrey';
            this.canvas.beginPath();
            this.canvas.fillRect(this.part.x, this.part.y, this.part.width, this.part.height);
            this.canvas.stroke();

            var start_x = this.part.x;
            var start_y = this.part.y;
            var end_x = this.part.x + this.part.width;
            var end_y = this.part.y;

            this.drawLine(start_x, start_y, end_x, end_y, 'black');

            this.drawCircle(start_x, start_y, 'black');
            this.drawLine(start_x, start_y, this.north_cp1.x, this.north_cp1.y, 'tomato')
            this.drawCircle(this.north_cp1.x, this.north_cp1.y, 'tomato');

            this.drawCircle(end_x, end_y, 'black');
            this.drawLine(end_x, end_y, this.north_cp2.x, this.north_cp2.y, 'blue')
            this.drawCircle(this.north_cp2.x, this.north_cp2.y, 'blue');

            this.canvas.beginPath();
            this.canvas.moveTo(start_x, start_y);
            this.canvas.bezierCurveTo(
                this.north_cp1.x, this.north_cp1.y,
                this.north_cp2.x, this.north_cp2.y,
                end_x, end_y
            )
            this.canvas.strokeStyle = 'black';
            this.canvas.stroke();

            var num = 0;
            var perc = 0;
            var i = 0;
            var res = {};
            for (i = 0; i < this.TOTAL_GRADATIONS; i++) {
                res = this.getBezierXY(
                    i / this.TOTAL_GRADATIONS,
                    start_x,
                    start_y,
                    this.north_cp1.x,
                    this.north_cp1.y,
                    this.north_cp2.x,
                    this.north_cp2.y,
                    end_x,
                    end_y);
                if(i > 0) {
                    this.drawCircle(res.x, res.y, 'grey', this.CIRCLE_RADIUS / 2);
                    this.drawLine(res.x, res.y, res.x, end_y, 'peachpuff');
                }
                num = start_y - res.y;
                perc = (num * 100) / (start_y - start_x);
                this.canvas.fillText(perc.toFixed(2), res.x, res.y - 5);
            }

            start_x = this.part.x + this.part.width;
            start_y = this.part.y;
            end_x = this.part.x + this.part.width;
            end_y = this.part.y + this.part.height;

            this.drawLine(start_x, start_y, end_x, end_y, 'black');

            this.drawCircle(start_x, start_y, 'black');
            this.drawLine(start_x, start_y, this.east_cp1.x, this.east_cp1.y, 'red')
            this.drawCircle(this.east_cp1.x, this.east_cp1.y, 'red');

            this.drawCircle(end_x, end_y, 'black');
            this.drawLine(end_x, end_y, this.east_cp2.x, this.east_cp2.y, 'green')
            this.drawCircle(this.east_cp2.x, this.east_cp2.y, 'green');

            this.canvas.beginPath();
            this.canvas.moveTo(start_x, start_y);
            this.canvas.bezierCurveTo(
                this.east_cp1.x, this.east_cp1.y,
                this.east_cp2.x, this.east_cp2.y,
                end_x, end_y
            )
            this.canvas.strokeStyle = 'black';
            this.canvas.stroke();

            for (i = 0; i < this.TOTAL_GRADATIONS; i++) {
                res = this.getBezierXY(
                    i / this.TOTAL_GRADATIONS,
                    start_x,
                    start_y,
                    this.east_cp1.x,
                    this.east_cp1.y,
                    this.east_cp2.x,
                    this.east_cp2.y,
                    end_x,
                    end_y);
                if(i > 0) {
                    this.drawCircle(res.x, res.y, 'grey', this.CIRCLE_RADIUS / 2);
                    this.drawLine(res.x, res.y, end_x, res.y, 'peachpuff');
                }
                num = start_y - res.y;
                perc = (num * 100) / (start_y - start_x);
                this.canvas.fillText(perc.toFixed(2), res.x, res.y - 5);
            }

            this.canvas.fillStyle = 'darkslategrey';
            var row = this.part.y + 10;
            this.canvas.fillText(
                "PART DIM = " + "x: " + this.part.x + ", y: " + this.part.y + ", w: " + this.part.width + ", h: " + this.part.height,
                this.part.x + this.TEXT_COLUMN_OFFSET,
                row += this.TEXT_ROW_OFFSET);
            this.canvas.fillText("T QUADS/BASE LAYER: " + this.quadsList.length,
                this.part.x + this.TEXT_COLUMN_OFFSET,
                row += this.TEXT_ROW_OFFSET);

            this.canvas.fillStyle = 'white';
            this.canvas.globalAlpha = 0.25;
            this.quadsList.forEach(element => {
                if(this.fillColour) {
                    this.canvas.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    this.canvas.beginPath();
                    this.canvas.fillRect(element.x, element.y, element.width, element.height);
                    this.canvas.stroke();
                }
                else {
                    this.canvas.strokeStyle = "grey";
                    this.canvas.beginPath();
                    this.canvas.rect(element.x, element.y, element.width, element.height);
                    this.canvas.stroke();
                }
            });
            this.canvas.globalAlpha = 1.0;

            if (this.showStars) {
                for (i = 0; i < this.hgradations.length; i++) {
                    this.drawStar(this.hgradations[i], this.part.y - 10, 5, 3, 2);
                }

            for (i = 0; i < this.vgradations.length; i++) {
                    this.drawStar(this.part.x + this.part.width + 10, this.vgradations[i], 5, 3, );
                }
            }
        }
    }
}
</script>
