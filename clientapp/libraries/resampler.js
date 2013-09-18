var Resample = (function (canvas) {

 // (C) WebReflection Mit Style License

 // Resample function, accepts an image
 // as url, base64 string, or Image/HTMLImgElement
 // optional width or height, and a callback
 // to invoke on operation complete
 function Resample(img, width, height, onresample) {
  var
   // check the image type
   load = typeof img == "string",
   // Image pointer
   i = load || img
  ;
  // if string, a new Image is needed
  if (load) {
   i = new Image;
   // with propers callbacks
   i.onload = onload;
   i.onerror = onerror;
  }
  // easy/cheap way to store info
  i._onresample = onresample;
  i._width = width;
  i._height = height;
  // if string, we trust the onload event
  // otherwise we call onload directly
  // with the image as callback context
  load ? (i.src = img) : onload.call(img);
 }
 
 // just in case something goes wrong
 function onerror() {
  throw ("not found: " + this.src);
 }
 
 // called when the Image is ready
 function onload() {
  var
   // minifier friendly
   img = this,
   // the desired width, if any
   width = img._width,
   // the desired height, if any
   height = img._height,
   // the callback
   onresample = img._onresample
  ;
  // if width and height are both specified
  // the resample uses these pixels
  // if width is specified but not the height
  // the resample respects proportions
  // accordingly with orginal size
  // same is if there is a height, but no width
  width == null && (width = round(img.width * height / img.height));
  height == null && (height = round(img.height * width / img.width));
  // remove (hopefully) stored info
  delete img._onresample;
  delete img._width;
  delete img._height;
  // when we reassign a canvas size
  // this clears automatically
  // the size should be exactly the same
  // of the final image
  // so that toDataURL ctx method
  // will return the whole canvas as png
  // without empty spaces or lines
  canvas.width = width;
  canvas.height = height;
  // drawImage has different overloads
  // in this case we need the following one ...
  context.drawImage(
   // original image
   img,
   // starting x point
   0,
   // starting y point
   0,
   // image width
   img.width,
   // image height
   img.height,
   // destination x point
   0,
   // destination y point
   0,
   // destination width
   width,
   // destination height
   height
  );
  // retrieve the canvas content as
  // base4 encoded PNG image
  // and pass the result to the callback
  onresample(canvas.toDataURL("image/png"));
 }
 
 var
  // point one, use every time ...
  context = canvas.getContext("2d"),
  // local scope shortcut
  round = Math.round
 ;
 
 return Resample;
 
}(
 // lucky us we don't even need to append
 // and render anything on the screen
 // let's keep this DOM node in RAM
 // for all resizes we want
 this.document.createElement("canvas"))
);
