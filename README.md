## Audio GIFs (`.a.gif`)

*"Sounds Like a Bad Idea."*

**TL;DR:** **An Audio GIF *stores audio inside a standards compliant Animated GIF image*.**

 * Unlike other approaches there is *no need for a separate audio or video file*.
 * Use `Save As...` on the Animated GIF image file and the audio comes along for the ride.
 * Share the Animated GIF file and you've shared the audio!

### Samples

 * View & hear the "show reel" here: <http://audiogif.rancidbacon.com/start>

### Project repository & home

 * Get tools to create & play your own Audio GIFs: <https://github.com/RancidBacon/audiogif>
 * Project home: <http://audiogif.rancidbacon.com/>

### On this page

 * How to create an Audio GIF
 * Specification for "Audio for GIF" Application Extension
    * Reference Implementation: Encoder
    * Reference Implementation: Player
 * FAQ
 * References
 * Changelog

## How to create an Audio GIF

### 1. Extract the portion of video/audio you want to Audio GIF.

  * *Requires `ffmpeg` to be installed first.*

This can probably done as a one-liner but this way we can check
we've cropped/shortened correctly first.

```
ffmpeg -ss MM:SS.mm -t SS.mm -i input_video.mp4 -vf "crop=out_w=660:out_h=522:x=250:y=0" -c:a aac -map 0:v -map 0:a my_new.mp4
ffmpeg -ss MM:SS.mm -t SS.mm -i input_video.mp4 -ar 22050 -ac 1 my_new.wav
```

### 2. Convert extracted video into an animated GIF.

Note: The `gif-encoder.sh` script has some hardcoded values you may wish to change.

```
tools/gif-encoder.sh my_new.mp4 my_new.gif
```

### 3. Add audio to your animated GIF to make it an Audio GIF!

  * *Requires [`kaitaistruct`runtime library for Python](https://pypi.org/project/kaitaistruct/) to be installed first.*

```
tools/gif-audio-add.py my_new.gif my_new.wav
```

Creates a new file named `my_new.a.gif` which is the recommend file extension for Audio GIFs.

### 4. View and hear your new Audio GIF!

You might like to ask your favourite software to add support for the Audio GIF format.



## Specification for "Audio for GIF" Application Extension

```
"Audio for GIF" Application Extension (a.k.a Audio GIF) Specification v0.1

[0x21] Extension Introducer
[0xFF] Extension Label (Standard: "Application Extension")

[0x0B] Block Size (Standard: There are 11 bytes before application data)
[0x41][0x55][0x44][0x49][0x4F][0x47][0x49][0x46] Application Identifier ("AUDIOGIF")
[0x30][0x2E][0x31] Application Authentication Code ("0.1")

[0x01] Block Size (New: Audio Metadata Sub-Block)
[0x01] Audio Data Format (New: 0x00 == Reserved (for WebAudio native format) 0x01 == Determine format by introspection--not implemented assumes .wav))

[Subblock Length][Subblock Data] N * Blocks of Audio (file) data.

[0x00] Empty sub-block marks end of audio data. (Standard)
```

### Reference Implementation: Encoder

See `tools/gif-audio-add.py` in this repository. The Reference Implementation Encoder builds on the work of <https://ffmpeg.org/> and <http://kaitai.io/>.

### Reference Implementation: Player

See `thirdparty/gifuct-js` in this repository. The Reference Implementation Player is based on <https://github.com/matt-way/gifuct-js> with Audio GIF functionality added. I chose `gifuct-js`  because it was the easiest to modify JavaScript GIF library that I found.


## FAQ

* **But why?**

  Because sounds like a bad idea. :)

[TODO]

## References

* <https://www.w3.org/Graphics/GIF/spec-gif89a.txt>
* <http://www.matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp>
* <http://formats.kaitai.io/gif/index.html>
* <http://fileformats.archiveteam.org/wiki/GIF>

## Changelog

* 2019-05-16 Initial v0.1 release.

The Audio GIF is brought to you by <http://RancidBacon.com/>.
