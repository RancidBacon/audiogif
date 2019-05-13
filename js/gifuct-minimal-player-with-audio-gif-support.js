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
                audio_wav_data = new Uint8Array(gif.raw.frames[0].application.blocks.slice(1));
                audioCtx.decodeAudioData(audio_wav_data.buffer).then(function(decodedData){
                  ////console.log(decodedData);
                  audio_pcm_data = decodedData;
                });

                var frames = gif.decompressFrames(true);
                ////console.log(gif);
                // render the gif
                renderGIF(frames);
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

function renderGIF(frames){
        loadedFrames = frames;
        frameIndex = 0;

        c.width = frames[0].dims.width;
        c.height = frames[0].dims.height;

        gifCanvas.width = c.width;
        gifCanvas.height = c.height;

        if(!playing){
                playpause();
        }
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
