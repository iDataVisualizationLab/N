let worker = null;
if (!location.search) {
    location.search = 10000;
}
const canvasContainer = document.querySelector('d3fc-canvas');
canvasContainer.addEventListener('measure', ({ detail }) => {
    if (worker == null) {
        // worker = new Worker(`src/worker/canvas.js#${Number(location.search.substring(1))}`);
        worker = new Worker(`src/worker/canvas.js`);
        const canvas = canvasContainer
            .querySelector('canvas');
        if (canvas.transferControlToOffscreen == null) {
            alert(`It looks like OffscreenCanvas isn't supported by your browser`);
        }
        const offscreenCanvas = canvas.transferControlToOffscreen();
        worker.postMessage({ offscreenCanvas }, [offscreenCanvas]);
        worker.addEventListener('message', ({ data }) => {
            if (data !== 'frame') {
                document.querySelector('#loading>p').innerText = data;
            } else {
                document.querySelector('#loading').style.display = 'none';
            }
        });
    }
    const { width, height } = detail;
    worker.postMessage({ width, height });
});
canvasContainer.requestRedraw();

// const timestampContainer = document.querySelector('#timestamp');
//
// const updateTimestamp = () => {
//     timestampContainer.innerText = Date.now();
//     requestAnimationFrame(updateTimestamp);
// };
//
// updateTimestamp();
//
// document.querySelector('#alert').addEventListener('click', () => {
//     alert(
//         'This alert pauses the main thread, notice that the timestamp' +
//         ' has stopped updating. Dismissing the alert will resume the' +
//         ' main thread.'
//     );
// });