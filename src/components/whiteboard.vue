<template>
  <div>
    <canvas
      width="400"
      height="400"
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
    };
  },
  methods: {
    startPainting(e) {
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
      this.painting = false;
      this.ctx.beginPath();
      this.$socket.client.emit("stoped", false);
    },
    onFinishedPainting() {
      this.onpainting = false;
      this.ctx.beginPath();
    },
    draw(e) {
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
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
  },
  sockets: {
    drawing(e) {
      console.log(e);
      this.ondraw(e.x, e.l, e.y, e.t);
    },
    started(e) {
      console.log(e);
      this.onStartPainting(e.x, e.l, e.y, e.t);
    },
    stoped() {
      console.log("Stoped");
      this.onFinishedPainting;
    },
  },
};
</script>

<style scoped>
#canvas {
  border: solid lightgray;
}
</style>
