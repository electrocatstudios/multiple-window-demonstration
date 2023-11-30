# multiple-window-demonstration
Sharing information on the same computer between different browser windows, using 
LocalStorage.

## Background
This repository was my attempt to have a play with LocalStorage. I was inspired by 
[this video](https://www.youtube.com/watch?v=4LwHH3r2qNY)
It shows two browser windows, running locally, interacting with each other. 
I did not investigate the code, only having seen the video and suspecting what was 
going on (ie. using LocalStorage to hold multiple window states).
I wanted to have a go myself, before looking at the original code, which can be 
seen [here](https://github.com/bgstaal/multipleWindow3dScene).

## Design
I didn't want to just copy the same thing so I took inspiration
from [this scene from The Office(US)](https://www.youtube.com/watch?v=cb5DITStXlI).
We could have multiple characters who could face each other, in different windows. 

## Workflow
The page loads and generates a random choice of character, as well as an ID to identify 
the frame from others. It calculates the position of the character by using the offset 
of the window on the desktop, as well as the size of the window (because it always draws 
the character in the middle of the screen). It stores this information in LocalStorage 
so that every other window can access those locations. Every so often it will pick 
another character to point each arm at another random character. Moving any of those 
characters will cause the arm to track the new location. 

### Running locally
```bash
python3 -m http.server
```

Note: Requires Python to be installed, if using Windows, should already be installed on other 
operating systems.

---

## FAQ & Troubleshooting

### I'm getting a black background and not the office image
The application assumes that you are only using one monitor (just to reduce complexity) and 
so the background image will only scale to the primary screen. The application will work on 
a second monitor but you'll just see a void and not the carpet texture.
