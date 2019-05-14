
function setGIF(url) {

  // Everyone loves a "loading..." message...
  // TODO: Do this better... :)
  const placeholder_width = 400; // px
  const font_size = 14; // px

  c.width = placeholder_width;
  c.height = placeholder_width;

  setMessage(ctx, "#eb99a1", font_size, font_size, "Audio GIF", "loading");

  // Actually start loading of the file...
  loadGIF(url);

}