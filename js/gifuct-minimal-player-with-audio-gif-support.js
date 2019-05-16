// user canvas
var c = document.getElementById('c');
var ctx = c.getContext('2d');
// gif patch canvas
var tempCanvas = document.createElement('canvas');
var tempCtx = tempCanvas.getContext('2d');
// full gif canvas
var gifCanvas = document.createElement('canvas');
var gifCtx = gifCanvas.getContext('2d');

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();


var gif;
var audio_pcm_data;


// load a gif from the supplied url value
function loadGIF(gifUrl){
        var oReq = new XMLHttpRequest();
        oReq.open("GET", gifUrl, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                gif = new GIF(arrayBuffer);

                // TODO: Check AUDIOGIF header, version, type etc...
                audio_wav_data = new Uint8Array(gif.raw.frames[0].application.blocks.subarray(1));
                audioCtx.decodeAudioData(audio_wav_data.buffer, function(decodedData) {
                        ////console.log(decodedData);
                        audio_pcm_data = decodedData;
                });

                var frames = gif.decompressFrames(true);
                ////console.log(gif);
                // render the gif
                renderGIF(frames, gifUrl);
            }
        };

        oReq.send(null);
}

var playing = false;
var loadedFrames;
var frameIndex;

function playpause(){
        playing = !playing;
        if(playing){
                renderFrame();
        }
}

function wrapWithLink(gifUrl) {

        // Make "Save Link As..." work
        // TODO: Make "Save Image As..." work?
        // TODO: Don't recreate if already exists.
        var img_link = document.createElement("a")
        img_link.href = gifUrl;
        img_link.className = "img_link";
        c.parentElement.insertBefore(img_link, c);
        img_link.appendChild(c);

}


function setMessage(target_ctx, msg_fill_style, font_size_line_1, font_size_line_2, msg_line_1, msg_line_2) {

        // TODO: Do this better... :)
        target_ctx.textAlign = "center";
        target_ctx.textBaseline = "middle";

        target_ctx.fillStyle = msg_fill_style;

        target_ctx.font = font_size_line_1 + "px sans-serif";
        target_ctx.fillText(msg_line_1, target_ctx.canvas.width/2, ((target_ctx.canvas.height-font_size_line_1)/2)-(font_size_line_1*0.625));

        target_ctx.font = font_size_line_2 + "px sans-serif";
        target_ctx.fillText(msg_line_2, target_ctx.canvas.width/2, ((target_ctx.canvas.height-font_size_line_2)/2)+(font_size_line_2*0.625));

}


function setGIF(url) {

        // Everyone loves a "loading..." message...
        // TODO: Do this better... :)
        const placeholder_width = 400; // px
        const font_size = 14; // px

        c.width = placeholder_width;
        c.height = placeholder_width;

	c.style.width = placeholder_width;
	c.style.height = placeholder_width;

        setMessage(ctx, "#eb99a1", font_size, font_size, "Audio GIF", "loading");

        // Actually start loading of the file...
        loadGIF(url);

}


function renderWhenAudioReady(gifUrl) {

        // Due to chang(ing|ed) WebAudio auto-play policies we need to detect when
        // we're not auto-playing and prompt the person viewing the page to interact
        // with the page.

        // TODO: Handle this better?

        audioCtx.resume();

        if (audioCtx.state == "suspended") {

                // TODO: Limit to events on the placeholder so we don't break the links?
                // TODO: Fix handling of right click.
                document.body.addEventListener('click', unlockAudioContext, true);
                document.body.addEventListener('touchstart', unlockAudioContext, true);
                document.body.addEventListener('touchend', unlockAudioContext, true);

                ctx.fillStyle = "#C7E3BE";
                ctx.fillRect(0, 0, c.width, c.height);

                setMessage(ctx, "#4a4a4a", 48, 24, "touch or click", "to hear the future of GIF");

                setTimeout(function() {renderWhenAudioReady(gifUrl);}, 100);
                return;
        }

        wrapWithLink(gifUrl);

        if(!playing){
                playpause();
        }

}


function unlockAudioContext(event) {
        // TODO: Handle this better?
        event.preventDefault();
        audioCtx.resume().then(function() {
                document.body.removeEventListener('click', unlockAudioContext, true);
                document.body.removeEventListener('touchend', unlockAudioContext, true);
                document.body.removeEventListener('touchstart', unlockAudioContext, true);
        });
};


function zoomOutMobile(targetWidth) {

        // via <https://stackoverflow.com/questions/22639296/force-mobile-browser-zoom-out-with-javascript>

        var viewport = document.querySelector('meta[name="viewport"]');

        if (viewport) {
                viewport.content = "initial-scale=0.1";
                viewport.content = "width=" + (targetWidth/0.90);
        }

}


function renderGIF(frames, gifUrl){
        loadedFrames = frames;
        frameIndex = 0;

        c.width = frames[0].dims.width;
        c.height = frames[0].dims.height;

	c.style.width = c.width;
	c.style.height = c.height;

        gifCanvas.width = c.width;
        gifCanvas.height = c.height;

	zoomOutMobile(c.width);

        renderWhenAudioReady(gifUrl);
}

var frameImageData;

function drawPatch(frame){
        var dims = frame.dims;

        if(!frameImageData || dims.width != frameImageData.width || dims.height != frameImageData.height){
                tempCanvas.width = dims.width;
                tempCanvas.height = dims.height;
                frameImageData = tempCtx.createImageData(dims.width, dims.height);
        }

        // set the patch data as an override
        frameImageData.data.set(frame.patch);

        // draw the patch back over the canvas
        tempCtx.putImageData(frameImageData, 0, 0);

        gifCtx.drawImage(tempCanvas, dims.left, dims.top);
}

function manipulate(){
        var imageData = gifCtx.getImageData(0, 0, gifCanvas.width, gifCanvas.height);

        ctx.putImageData(imageData, 0, 0);
}


var playback_start_time = -1;

function renderFrame(){

        // get the frame
        var frame = loadedFrames[frameIndex];

        var start = new Date().getTime();

        if (!(frame.hasOwnProperty("transparentIndex") && (frame.disposalType == 1))) {
            gifCtx.clearRect(0, 0, c.width, c.height);
        }

        // draw the patch
        drawPatch(frame);

        // perform manipulation
        manipulate();


        if ((frameIndex==0) && audio_pcm_data) {
            var source = audioCtx.createBufferSource();
            source.connect(audioCtx.destination);
            source.buffer = audio_pcm_data;
            source.start();
            playback_start_time = start;
        }


        if (audio_pcm_data) {
            // update the frame index
            frameIndex++;
            if(frameIndex >= loadedFrames.length){
                frameIndex = 0;
            }
        }

        var end = new Date().getTime();
        var diff = end - start;

        if(playing){
            //
            // The monstrosity in the next line of code is intended to
            // improve playback of longer duration Audio GIFS. It should
            // ensure that the last frame of the GIF displays as the audio
            // finishes playing (i.e. somewhat in sync).
            //
            // Note: The way this is currently implemented means that all
            //       supplied per-frame delay values are ignored except for
            //       the final frame.
            //
            // TODO: Double check this calculation is correct and/or handle
            //       variable per-frame delay values.
            //
            var nextDelay = ((playback_start_time > -1) && (frameIndex != 0)) ? ((playback_start_time + (((audio_pcm_data.duration * 1000) / (loadedFrames.length-1))*(frameIndex+1))) - end) : frame.delay;
                // delay the next gif frame
                setTimeout(function(){
                        requestAnimationFrame(renderFrame);
                        //renderFrame();
                }, Math.max(0, Math.floor(nextDelay)));
        }
}
