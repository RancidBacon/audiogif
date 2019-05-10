#!/usr/bin/env python
#
# Usage:
#
#    gif-audio-add.py <input.gif> <input.wav>
#
# Creates new file named `<input>.a.gif` which has the recommended
# file extension for Audio GIFs.
#
# Dependencies:
#
#  * Kaitai Struct runtime library for Python: <https://pypi.org/project/kaitaistruct/>
#
#
# Part of the RancidBacon.com Audio GIF tool suite: <http://audiogif.rancidbacon.com/>
#
# License: The MIT License (MIT)
#
# Author: follower@rancidbacon.com (2018-2019)
#
# Version: v0.1
#

import os
import sys

from gif import Gif

if __name__ == "__main__":

  try:
    original_gif_file_path = sys.argv[1]
    audio_file_path = sys.argv[2]
  except IndexError:
      print """
Usage: gif-audio-add.py <input.gif> <input.wav>

Creates new file named `<input>.a.gif` which has the recommended
file extension for Audio GIFs.
"""
      raise SystemExit


  output_file_path = os.path.splitext(original_gif_file_path)[0] + ".a.gif"

  print "Output filepath:", output_file_path

  if os.path.exists(output_file_path):
      print "Output file path exists, not overwriting. Stopping."
      raise SystemExit


  data = Gif.from_file(original_gif_file_path)

  calculated_offset = 0

  #print data.hdr.magic, # 3 bytes
  #print data.hdr.version # 3 bytes

  calculated_offset += (3 + 3)

  # logical screen descriptor # 7 bytes

  calculated_offset += 7

  if data.logical_screen_descriptor.has_color_table:

    global_color_table_byte_size = len(data._raw_global_color_table)

    print "Skipping global color table of size: %d bytes" % global_color_table_byte_size

    calculated_offset += global_color_table_byte_size

  else:

    print "No global color table to skip."

  #print "%d (%x)" % (calculated_offset, calculated_offset)


  raw_gif_file = open(original_gif_file_path, "rb").read()

  #print ord(raw_gif_file[calculated_offset]), Gif.BlockType.extension.value

  if ord(raw_gif_file[calculated_offset]) != Gif.BlockType.extension.value:
    raise Exception("Required extension block not found (is this an *animated* GIF?)")


  # See: "Audio for GIF Application Extension (a.k.a Audio GIF) Specification v0.1"
  #print Gif.BlockType.extension.value, Gif.ExtensionLabel.application.value, 0x0b, "AUDIOGIF", "0.1", 0x00

  audio_file_data = open(audio_file_path, "rb").read()

  new_extension_block = "".join([
                 chr(Gif.BlockType.extension.value), chr(Gif.ExtensionLabel.application.value),
                 chr(0x0b), "AUDIOGIF", "0.1",
                 chr(0x01), chr(0x01), # New: Audio metadata sub-block (0x01 == decoder/player should determine audio data format by introspection)
                 "".join([chr(len(current_subblock)) + current_subblock
                  for current_subblock in [audio_file_data[subblock_offset:subblock_offset+0xff]
                    for subblock_offset in range(0, len(audio_file_data), 0xff)]]), # N subblocks of (length, data)
                 chr(0x00) # Empty sub-block
                ])


  ##print repr(new_extension_block)

  open(output_file_path, "wb").write(raw_gif_file[:calculated_offset] + new_extension_block + raw_gif_file[calculated_offset:])

  print "Done."
