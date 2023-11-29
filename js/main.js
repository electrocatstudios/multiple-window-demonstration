let canvas = null;  
let ctx = null; 

let ident = null;
let character = null;
let ROTATION = 0;

const CHAR_LIST = ["andy", "michael", "dwight", "pam"];

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    let rand = Math.floor(Math.random() * 4);
    
    character = CHAR_LIST[rand];
    ident = crypto.randomUUID();

    console.log(character, ident);

    setInterval(update, 100);
}

function update() {

    let offsetX = window.screenX * -1;
    let offsetY = window.screenY * -1;

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.fillRect(0,0,canvas.width, canvas.height);
    
    // Background
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

    // Character
    if(character == null){
        return;
    }
    let body = IMAGE_LOADER.get_image("assets/images/" + character + "/body.png");
    let left = IMAGE_LOADER.get_image("assets/images/" + character + "/left_arm.png");
    let right = IMAGE_LOADER.get_image("assets/images/" + character + "/right_arm.png");

    if(body == null || left == null || right == null) {
        // Image not ready yet
        return;
    }
    // Draw right arm
    // ctx.translate((canvas.width/2)-25, (canvas.height/2));
    // ctx.translate((canvas.width/2)-25, (canvas.height/2));

    // ctx.drawImage(right, (canvas.width/2) - 25, canvas.height/2);
    
    ROTATION += 0.05;

    ctx.translate((canvas.width/2) + 50, (canvas.height/2) + 25);
    ctx.rotate(ROTATION);
    ctx.translate((-canvas.width/2) - 50, (-canvas.height/2) - 25 );

    ctx.drawImage(right, (canvas.width/2) + 10, canvas.height/2 + 10 );
    ctx.drawImage(left, (canvas.width/2) + 70, canvas.height/2 + 10 );
    ctx.drawImage(body, canvas.width/2, canvas.height/2);

    
}