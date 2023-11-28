let canvas = null;  
let ctx = null; 

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    setInterval(update, 100);
}

function update() {

    let offsetX = window.screenX * -1;
    let offsetY = window.screenY * -1;

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.fillRect(0,0,canvas.width, canvas.height);
    
    let image = IMAGE_LOADER.get_image("assets/images/background.png");
    if(image != null) {
        // Scale if window is not same as the image
        let iwidth = image.width;
        let iheight = image.height;

        if(window.screen.width != image.width) {
            iwidth = window.screen.width;
        }
        if(window.screen.height != image.height) {
            iheight = window.screen.height;
        }
        
        // Draw scaled image with offset
        ctx.drawImage(image, offsetX, offsetY, iwidth, iheight*0.9);
    }
}