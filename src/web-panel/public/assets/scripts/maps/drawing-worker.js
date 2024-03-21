let scale = 1;
let size = 128;

let mapColors = {};


self.addEventListener('message', (event) => {
    const { name } = event.data;

    if (name === "config") {
        const { data } = event.data;

        scale = data.scale;
        size = data.size;
        mapColors = data.mapColors;
        return;
    }

    if (name === "draw-the-map") {
        const { id, data } = event.data.data;

        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            for (let j = 0; j < row.length; j++) {
                const colorId = row[j];

                ctx.fillStyle = toHEX(colorId);
                ctx.fillRect(j * scale, i * scale, scale, scale);
            }
        }

        self.postMessage({ id, bitmap: canvas.transferToImageBitmap() });
        return;
    }
});

function toHEX(id) {
    if (id < 4) return "#00000000";
    const color = mapColors[id];
    if (!color) return "#ff0000";

    let hex = "#";
    for (const rgb of color) hex += (rgb < 16 ? "0" : "") + rgb.toString(16);

    return hex;
}