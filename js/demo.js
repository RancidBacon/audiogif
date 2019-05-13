
function setGIF(url) {
  loadGIF(url);

  var img_link = document.createElement("a")
  img_link.href = url;
  img_link.className = "img_link";
  c.parentElement.insertBefore(img_link, c);
  img_link.appendChild(c);
}