#!/bin/sh
#
# Usage example:
#
#   ./gif-encoder.sh <input.mp4> <output.gif>
#
# Produces better looking animated GIFs by using ffmpeg's two pass approach.
#
# Dependencies:
#
#   * ffmpeg
#
#
# Part of the RancidBacon.com Audio GIF tool suite: <http://audiogif.rancidbacon.com/>
#
#
# Related links:
#
#   * <https://github.com/SleepProgger/my_ffmpeg_utils/blob/master/ffmpeg_vid2gif.sh>
#   * <https://github.com/kkroening/ffmpeg-python>
#   * Issue that I encountered when trying to use `ffmpeg-python`: <https://lists.ffmpeg.org/pipermail/ffmpeg-user/2018-February/038976.html>
#
#
# All via <http://cassidy.codes/blog/2017/04/25/ffmpeg-frames-to-gif-optimization/>
#       & <http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html>
#
#
# Version: v0.1
#

palette="/tmp/palette.png"

# 10-15 fps seems to give a reasonable result.
#filters="fps=15,scale=400:-1:flags=lanczos"
filters="fps=12,scale=350:-1:flags=lanczos"

ffmpeg -v warning -i $1 -vf "$filters,palettegen=stats_mode=diff" -y $palette

# Note: Tailored to add a longer delay for the last frame which could be removed
#       if your GIF requires a continuous looping sound.
ffmpeg -i $1 -i $palette -lavfi "$filters,paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -final_delay 30 -y $2
