let IMAGE_LOADER = new ImageLoader();

function ImageLoader() {
    this.images = {};
    this.get_image = ImageLoaderGetImage;
    this.set_image_loaded = ImageLoaderSetImageLoaded;
}

function ImageLoaderGetImage(name) {
    if(this.images[name] != undefined && this.images[name].loaded == false) {
        return null;
    } else if (this.images[name] != undefined) {
        return this.images[name].image;
    }

    let img = new Image();
    img.src = name;
    img.onload = function() {
        IMAGE_LOADER.set_image_loaded(name);
    };

    this.images[name] = {
        loaded: false,
        image: img
    }
    return null;
}

function ImageLoaderSetImageLoaded(name) {
    if(this.images[name] == undefined){
        console.log("Loaded an image which doesn't exist!");
        return;
    }
    this.images[name].loaded = true;
}