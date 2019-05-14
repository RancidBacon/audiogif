
function setGIF(url) {

  // Everyone loves a "loading..." message...
  // TODO: Do this better... :)
  const placeholder_width = 400; // px
  const font_size = 14; // px

  c.width = placeholder_width;
  c.height = placeholder_width;

  ctx.font = font_size + "px sans-serif";
  ctx.fillStyle = "#eb99a1";
  ctx.textAlign = "center";

  ctx.fillText("Audio GIF", placeholder_width/2, ((placeholder_width-font_size)/2)-(font_size*0.625));
  ctx.fillText("loading", placeholder_width/2, ((placeholder_width-font_size)/2)+(font_size*0.625));

  // Actually start loading of the file...
  loadGIF(url);

  wrapWithLink(url);

}