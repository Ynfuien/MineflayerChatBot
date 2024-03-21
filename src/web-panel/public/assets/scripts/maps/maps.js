import { ChatMessage } from "../utils/chat-message.js";

export { setup, updateMapColors, handleMapPacket, toggleVisibility, isHidden, clear, MCMap };


/** @type {import("../index.js").Main} */
let main;

const SCALE = 1;
let SIZE = SCALE * 128;

// HTML stuff
const MAX_MAP_COUNT = 4;
let viewerImage = null;
let currentMap = {
    id: null,
    index: null
};
let currentMargin = 0;
let hidden = true;


// Drawing workers
const WORKERS_COUNT = 3;
const workers = [];

let workerIterator = 0;
function getWorker() {
    const worker = workers[workerIterator];

    workerIterator++;
    if (workerIterator > WORKERS_COUNT - 1) workerIterator = 0;

    return worker;
}

/**
 * @param {import("../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    const { rootFontSize } = main;

    // SCALE * 128px
    SIZE = SCALE * (8 * rootFontSize);

    const { maps } = main;
    const { elements, list, byId } = maps;
    const { viewer, main: mainElement } = elements;
    const { left, right } = viewer;

    viewerImage = viewer.img;

    // Workers
    for (let i = 0; i < WORKERS_COUNT; i++) {
        const worker = new Worker("/assets/scripts/maps/drawing-worker.js");
        workers.push(worker);

        worker.postMessage({
            name: "config",
            data: {
                scale: SCALE,
                size: SIZE,
                mapColors: main.config.mapColors
            }
        });

        worker.addEventListener("message", event => {
            const { id, bitmap } = event.data;

            const map = byId[id];
            const ctx = map.canvas.getContext("2d");

            ctx.drawImage(bitmap, 0, 0);
            if (currentMap.id === id) map.copyToImage(viewerImage);
        });
    }

    // Map navigation
    mainElement.style.setProperty("--max-map-count", MAX_MAP_COUNT);

    mainElement.addEventListener("keydown", (event) => {
        const { key } = event;

        if (key === "ArrowLeft") nextMap(false);
        else if (key === "ArrowRight") nextMap(true);
    });

    left.addEventListener("click", () => nextMap(false));
    right.addEventListener("click", () => nextMap(true));

    function nextMap(right) {
        if (list.length < 2) return;

        // Get new index
        let { index } = currentMap;
        index += right ? 1 : -1;
        if (index < 0) {
            index = list.length - 1;
            currentMargin = Math.max(index - MAX_MAP_COUNT, 0);
        }
        else if (index > list.length - 1) {
            index = 0;
            currentMargin = 0;
        }

        // Remove select
        byId[currentMap.id].canvas.parentElement.classList.remove("selected");

        // Set index and id
        const map = list[index];
        const newId = map.id;
        currentMap.id = newId;
        currentMap.index = index;

        // Render
        map.copyToImage(viewerImage);

        // Select
        viewerImage.title = `Id #${newId}`;
        map.canvas.parentElement.classList.add("selected");

        // Move the list
        if (index + 1 > currentMargin + MAX_MAP_COUNT) {
            currentMargin++;
        } else if (index < currentMargin) {
            currentMargin--;
        }

        list[0].canvas.parentElement.style.marginLeft = `calc((var(--map-size) + var(--column-gap)) * -${currentMargin})`;
    }
}

function updateMapColors() {
    for (const worker of workers) {
        worker.postMessage({
            name: "config",
            data: {
                scale: SCALE,
                size: SIZE,
                mapColors: main.config.mapColors
            }
        });
    }
}


function toggleVisibility() {
    const { main: mainElement } = main.maps.elements;

    mainElement.classList.toggle("hidden");
    hidden = !hidden;
}

function isHidden() {
    return hidden;
}

function clear() {
    const { list, byId } = main.maps;

    for (const map of list) {
        map.canvas.parentElement.remove();
        delete byId[map.id];
    }

    list.splice(0, list.length);
    // Empty image
    viewerImage.src = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
    viewerImage.title = "";

    const message = new ChatMessage({ color: "red", text: "No maps are loaded." });
    const canvasList = main.maps.elements.list;
    canvasList.textContent = '';
    canvasList.appendChild(message.toHTML("mc-text"));
}


/**
 * @param {Object} packet 
 */
function handleMapPacket(packet) {
    const { elements, list, byId } = main.maps;
    const { list: canvasList } = elements;

    const { itemDamage: id } = packet;

    // Update map
    if (byId[id]) {
        const map = byId[id];
        map.update(packet);
        return;
    }

    if (list.length === 0) canvasList.textContent = '';

    // Create map
    const map = new MCMap(packet);
    byId[id] = map;
    list.push(map);

    // Create HTML for the map
    const li = document.createElement("li");
    li.appendChild(map.canvas);
    canvasList.appendChild(li);

    if (currentMap.id === null) {
        currentMap.id = id;
        currentMap.index = 0;

        viewerImage.title = `Id #${id}`;
        li.classList.add("selected");
        if (!hidden) map.draw();
    }

    li.addEventListener("click", () => {
        if (id === currentMap.id) return;

        byId[currentMap.id].canvas.parentElement.classList.remove("selected");

        currentMap.id = id;
        currentMap.index = list.indexOf(map);

        viewerImage.title = `Id #${id}`;
        if (!hidden) map.copyToImage(viewerImage);
        li.classList.add("selected");
    });
}


class MCMap {
    /** @type {number[][]} */
    data = [];

    constructor(packet) {
        this.id = packet.itemDamage;
        this.canvas = document.createElement("canvas");
        this.canvas.width = SIZE;
        this.canvas.height = SIZE;
        this.canvas.title = `Id #${this.id}`;

        this.data = new Array(128);
        for (let i = 0; i < 128; i++) {
            this.data[i] = new Array(128).fill(0);
        }

        this.update(packet);
    }

    update(packet) {
        this.scale = packet.scale;
        this.locked = packet.locked;
        this.icons = packet.icons;
        this.#updateData(packet);
    }

    #updateData(packet) {
        const { columns, rows, x, y, data } = packet;
        if (columns < 1) return;

        let dataIndex = 0;
        for (let i = 0; i < rows; i++) {
            const row = i + y;

            for (let j = 0; j < columns; j++) {
                const column = j + x;

                const colorId = data[dataIndex];
                this.data[row][column] = colorId;

                dataIndex++;
            }
        }
        this.draw();
    }

    draw() {
        getWorker().postMessage({
            name: "draw-the-map",
            data: {
                id: this.id,
                data: this.data
            }
        });
    }

    /**
     * @param {HTMLImageElement} imageElement 
     */
    copyToImage(imageElement) {
        const { canvas } = this;

        const base64 = canvas.toDataURL();
        imageElement.src = base64;
    }
}