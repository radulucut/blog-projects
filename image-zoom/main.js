class ImageZoom {
  constructor(canvas, input, reset) {
    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.image.onload = () => this.onImageLoad();

    this.canvas = canvas;
    this.canvas.onclick = () => this.onZoom();
    this.canvas.onmousemove = event => this.onCanvasHover(
      event.offsetX, event.offsetY);
    this.ctx = canvas.getContext('2d');

    input.onchange = event => this.onURLChange(event.target);
    reset.onclick = () => this.onReset();

    // Photo by Benjamin Behre on Unsplash
    this.image.src = 'https://images.unsplash.com/photo-1556724600-78e84788fca5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  }

  onImageLoad() {
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.hWidth = Math.floor(this.canvas.width / 2);
    this.hHeight = Math.floor(this.canvas.height / 2);

    this.onReset();

    this.rectData = [
      new ImageData(this.getLine((this.hWidth + 2) * 4), this.hWidth + 2, 1),
      new ImageData(this.getLine(this.hHeight * 4), 1, this.hHeight)
    ];
  }

  onZoom() {
    if (this.strokeData) {
      this.cleanStroke();
      this.strokeData = null;
    }

    this.ctx.drawImage(this.canvas,
      this.dx, this.dy, this.hWidth, this.hHeight,
      0, 0, this.canvas.width, this.canvas.height);
  }

  onURLChange(target) {
    if (target.checkValidity())
      this.image.src = target.value;
  }

  onReset() {
    this.strokeData = null;
    this.ctx.drawImage(this.image, 0, 0);
  }

  onCanvasHover(cx, cy) {
    this.dx = Math.floor(Math.min(this.canvas.width - this.hWidth,
      Math.max(cx - this.hWidth / 2, 0)));
    this.dy = Math.floor(Math.min(this.canvas.height - this.hHeight,
      Math.max(cy - this.hHeight / 2, 0)));

    if (this.strokeData)
      this.cleanStroke();
    this.saveStrokeData(this.dx - 1, this.dy - 1, this.hWidth + 2, this.hHeight);

    this.strokeRect(this.dx - 1, this.dy - 1, this.hWidth + 2, this.hHeight)
  }

  saveStrokeData(x, y, width, height) {
    this.strokeData = [
      {
        x: x,
        y: y,
        data: this.ctx.getImageData(x, y, width, 1)
      },
      {
        x: x + width - 1,
        y: y + 1,
        data: this.ctx.getImageData(x + width - 1, y + 1, 1, height)
      },
      {
        x: x,
        y: y + height + 1,
        data: this.ctx.getImageData(x, y + height + 1, width, 1)
      },
      {
        x: x,
        y: y + 1,
        data: this.ctx.getImageData(x, y + 1, 1, height)
      }
    ];
  }

  cleanStroke() {
    for (let line of this.strokeData)
      this.ctx.putImageData(line.data, line.x, line.y);
  }

  strokeRect(x, y, width, height) {
    this.ctx.putImageData(this.rectData[0], x, y);
    this.ctx.putImageData(this.rectData[1], x + width - 1, y + 1);
    this.ctx.putImageData(this.rectData[0], x, y + height + 1);
    this.ctx.putImageData(this.rectData[1], x, y + 1);
  }

  getLine(size) {
    let arr = new Uint8ClampedArray(size);

    let index = 0;
    while (index < size) {
      arr[index] = 255;
      arr[index + 3] = 255;
      index += 4;
    }

    return arr;
  }
}

const canvas = document.getElementById('canvas');
const input = document.getElementById('imageUrl');
const reset = document.getElementById('reset');
new ImageZoom(canvas, input, reset);