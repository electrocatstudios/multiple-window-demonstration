let canvas = null;  
let ctx = null; 

let ident = null;
let character = null;

let state = null;

let pointing_at = { left: null, right: null, cooldown: 0, cur_rot: 0, desired_rot: 0 };

const ROTATION_SPEED = 0.15;
const POINT_COOLDOWN_MIN = 20;
const POINT_COOLDOWN_MAX = 50;

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

    // Get character positions that are not us
    let other_char_pos = [];

    // Update the state stored for our character
    for(var i=0;i<state.chars.length;i++){
        if(state.chars[i].id == ident){
            state.chars[i].position.x = position.x;
            state.chars[i].position.y = position.y;
        } else {
            other_char_pos.push({
                name: state.chars[i].name,
                x: state.chars[i].position.x,
                y: state.chars[i].position.y,
            });
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
    
    if(pointing_at.cooldown <= 0){
        pointing_at.cooldown = POINT_COOLDOWN_MIN + (Math.random() * (POINT_COOLDOWN_MAX-POINT_COOLDOWN_MIN));
        pointing_at.left = get_random_char(other_char_pos);
        pointing_at.right = get_random_char(other_char_pos);
        pointing_at.cur_rot = pointing_at.desired_rot;
        // console.log("Setting  new pointing at", JSON.stringify(pointing_at));
    } else {
        pointing_at.cooldown -= 1;
    }

    let point_left = get_point_for_char(other_char_pos, pointing_at.left);
    let point_right = get_point_for_char(other_char_pos, pointing_at.right);

    // Calculate body rotation
    let angle_left = get_angle_to_point(position, point_left);
    let angle_right = get_angle_to_point(position, point_right);

    // Get most appropriate average of the two points to 
    pointing_at.desired_rot = get_best_avg(angle_left, angle_right);
    
    // $('#debug').html("left: " + angle_left + ", right: " + angle_right + ", body: " + pointing_at.desired_rot);

    // Rotate towards desired state
    if(pointing_at.desired_rot > pointing_at.cur_rot) {
        if(pointing_at.desired_rot - pointing_at.cur_rot < ROTATION_SPEED){
            pointing_at.cur_rot = pointing_at.desired_rot;
        } else {
            pointing_at.cur_rot += ROTATION_SPEED;
        }
    } else if (pointing_at.desired_rot < pointing_at.cur_rot) {
        if(pointing_at.cur_rot - pointing_at.desired_rot < ROTATION_SPEED){
            pointing_at.cur_rot = pointing_at.desired_rot;
        } else {
            pointing_at.cur_rot -= ROTATION_SPEED;
        }
    }

    // Feet first, just in the middle
    drawImage(ctx, feet, canvas.width/2, canvas.height/2,  pointing_at.cur_rot);

    // Arms - TODO: Calculate each arm rotation
    drawImage(ctx, right, (canvas.width/2) - (35*Math.cos(pointing_at.cur_rot-0.5)), canvas.height/2 - (35*Math.sin(pointing_at.cur_rot-0.5)), angle_right);
    drawImage(ctx, left, (canvas.width/2) + (35*Math.cos(pointing_at.cur_rot+0.5)), canvas.height/2 + (35*Math.sin(pointing_at.cur_rot+0.5)), angle_left);
    
    // Finally body - same as feet
    drawImage(ctx, body, canvas.width/2, canvas.height/2,  pointing_at.cur_rot);
    
}

function get_angle_to_point(pt1, pt2) {
    if(pt1 == undefined || pt2 == undefined) {
        return 0;
    }
    let ret = Math.atan2(pt1.x - pt2.x, pt2.y-pt1.y);
    if(ret < 0) {
        return ret + (Math.PI * 2);
    } else if (ret > Math.PI * 2) {
        return ret - (Math.PI * 2);
    } else {
        return ret;
    }
}

function drawImage(context, img, x, y, rot) {
    context.save();
    
    // Center the image
    x -= img.width/2;
    y -= img.height/2;
    
    // Set the origin to the center of the image
    context.translate(x + img.width/2, y + img.height/2);
    
    // Rotate the canvas around the origin
    context.rotate(rot);

    // Draw the image   
    context.drawImage(img, 0, 0, img.width, img.height, -img.width/2, -img.height/2, img.width, img.height);
    
    context.restore();
}

function get_random_char(pts) {
    console.log(pts);
    if(pts.length < 1) {
        return {x: 0, y: 0};
    }
    let idx = Math.floor(Math.random() * pts.length);
    console.log(idx, pts[idx]);
    return pts[idx].name;
}

function get_point_for_char(pts, name) {
    for(var i=0;i<pts.length;i++){
        if(pts[i].name == name){
            return {
                x: pts[i].x,
                y: pts[i].y
            };
        }
    }
    return {x:0,y:0};
}


function get_best_avg(point_left, point_right) {
    if(point_left == point_right) {
        return point_left;
    }

    if(Math.abs(point_left-point_right) < Math.abs( (point_left+(Math.PI*2.0))-point_right)) {
        return (point_left+point_right) /2;
    } else {
        return ((point_left + (Math.PI*2.0)) - point_right) / 2;
    }
}