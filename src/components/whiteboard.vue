<template>
  <div>
    <canvas
      width="350"
      height="350"
      @mousedown="startPainting"
      @mouseup="finishedPainting"
      @mousemove="draw"
      id="canvas"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "whiteboard",
  data() {
    return {
      vueCanvas: null,
      painting: false,
      onpainting: false,
      canvas: null,
      ctx: null,
      isDrawing: false,
    };
  },
  methods: {
    startPainting(e) {
      if (!this.isDrawing) return;
      this.painting = true;

      let rect = this.canvas.getBoundingClientRect();
      let x = e.clientX;
      let l = rect.left;
      let y = e.clientY;
      let t = rect.top;
      this.$socket.client.emit("started", { x, l, y, t });
      this.draw(e);
    },
    onStartPainting(x, l, y, t) {
      this.onpainting = true;
      this.ondraw(x, l, y, t);
    },
    finishedPainting() {
      if (!this.isDrawing) return;
      this.painting = false;
      this.ctx.beginPath();
      this.$socket.client.emit("stoped", false);
    },
    onFinishedPainting() {
      this.onpainting = false;
      console.log("onFinishedPainting");
      this.ctx.beginPath();
    },
    draw(e) {
      if (!this.isDrawing) return;
      if (!this.painting) return;

      this.ctx.lineWidth = 10;
      this.ctx.lineCap = "round";

      let rect = this.canvas.getBoundingClientRect();
      this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

      let x = e.clientX;
      let l = rect.left;
      let y = e.clientY;
      let t = rect.top;

      this.$socket.client.emit("drawing", { x, l, y, t });
    },
    ondraw(x, l, y, t) {
      if (!this.onpainting) return;
      this.ctx.lineWidth = 10;
      this.ctx.lineCap = "round";

      this.ctx.lineTo(x - l, y - t);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(x - l, y - t);
    },
    erase() {
      let w = this.canvas.width;
      let h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);
    },
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
  },
  sockets: {
    drawing(e) {
      console.log("draw");
      this.ondraw(e.x, e.l, e.y, e.t);
    },
    started(e) {
      console.log("start");
      this.onStartPainting(e.x, e.l, e.y, e.t);
    },
    stoped() {
      console.log("Stoped");
      this.onFinishedPainting();
    },
    erase() {
      console.log("erase");
      this.erase();
    },
    isdrawing() {
      this.isDrawing = true;
    },
    stopdrawing() {
      this.isDrawing = false;
    },
  },
};
</script>

<style scoped>
#canvas {
  border: solid lightgray;
}
</style>
