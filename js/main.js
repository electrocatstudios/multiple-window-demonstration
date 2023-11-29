let canvas = null;  
let ctx = null; 

let ident = null;
let character = null;

let state = null;

const LS_KEY_NAME = "cs_positions";
const CHAR_LIST = ["andy", "michael", "dwight", "pam"];

function get_state() {
    let state = localStorage.getItem(LS_KEY_NAME);
    if(state == null) {
        state = {"chars": []}
    } else {
        state = JSON.parse(state);
    }
    return state;
}

function set_state(new_state) {
    localStorage.setItem(LS_KEY_NAME, JSON.stringify(new_state));
}

function reset_state() {
    localStorage.removeItem(LS_KEY_NAME);
    location.reload();
}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
  
    state = get_state();

    ident = crypto.randomUUID();

    if(state.chars.length == CHAR_LIST.length) {
        console.log("All characters accounted for");
        reset_state();
        return;
    }

    let quit = false;
    while(quit != true) {
        let rand = Math.floor(Math.random() * 4);
        character = CHAR_LIST[rand];
        let bFound = false;
        for(var i=0;i<state.chars.length;i++){
            let c = state.chars[i];
            if(c.name == character) {
                bFound = true;
            }
        }
        if(!bFound) {
            state.chars.push({
                "id": ident,
                "name": character,
                "position": {"x": 0, "y": 0}
            });
            quit = true;
        }
    }

    set_state(state);

    setInterval(update, 100);
}

function update() {

    let offsetX = window.screenX * -1;
    let offsetY = window.screenY * -1;

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    let position = {x:  window.screenX + ctx.canvas.width/2, y: window.screenY + ctx.canvas.height/2};
    let state = get_state();
    if(state.chars.length == 0){
        // Something has gone wrong - possibly another window nuked everything, so start again
        reset_state();
        return;
    }
    // Update the state stored for our character
    for(var i=0;i<state.chars.length;i++){
        if(state.chars[i].id == ident){
            state.chars[i].position.x = position.x;
            state.chars[i].position.y = position.y;
            break;
        }
    }
    set_state(state);

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
    let feet = IMAGE_LOADER.get_image("assets/images/" + character + "/feet.png");

    if(body == null || left == null || right == null || feet == null) {
        // Image not ready yet
        return;
    }
    
    // Calculate rotation
    let pos = {x:0, y:0};
    for(var i=0;i<state.chars.length;i++){
        if(state.chars[i].id != ident) {
            pos.x = state.chars[i].position.x;
            pos.y = state.chars[i].position.y;
        }
    }

    let rotation = get_angle_to_point(position, pos);

    // Apply translation and rotation
    ctx.translate((canvas.width/2) + 50, (canvas.height/2) + 25);
    ctx.rotate(rotation);
    ctx.translate((-canvas.width/2) - 50, (-canvas.height/2) - 25 );
    
    // Draw the assets
    ctx.drawImage(feet, canvas.width/2, canvas.height/2);
    ctx.drawImage(right, (canvas.width/2) + 10, canvas.height/2 + 10 );
    ctx.drawImage(left, (canvas.width/2) + 70, canvas.height/2 + 10 );
    ctx.drawImage(body, canvas.width/2, canvas.height/2);

}

function get_angle_to_point(pt1, pt2) {
    return Math.atan2(pt1.x - pt2.x, pt2.y-pt1.y);
}