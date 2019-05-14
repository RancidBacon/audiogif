
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

  setMessage(ctx, "#eb99a1", font_size, font_size, "Audio GIF", "loading");

  // Actually start loading of the file...
  loadGIF(url);

  wrapWithLink(url);

}