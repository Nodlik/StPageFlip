# StPageFlip
Powerful, simple and flexible JS Library for creating realistic and beautiful page turning effect

### Features
* Works with simple images on canvas and with complex html blocks
* Has a simple api and flexible configuration
* Compatibility with mobile devices
* Support landscape and portrait screen mode
* No additional libraries

Demo and docs: https://nodlik.github.io/StPageFlip/

### Installation
You can install the latest version using npm:

```npm install page-flip```

Or download bundle from Github

### Usage

If you installed the package from npm, you need import PageFlip from page-flip package, or just use ```<script/>``` tag:

```html
<script src="{path/to/scripts}/stPageFlip.bundle.js"></script>
```

Creation of a new PageFlip object:
```js
import PageFlip from 'flip-page';

const pageFlip = new PageFlip(htmlParentElement, settings);

// or if you using script tag:
const pageFlip = new St.PageFlip(htmlParentElement, settings);
```
Where htmlParentElement - HTMLElement, where the book will be created, settings - configuration object.

To drawing on the canvas, use the following method:
```js
pageFlip.loadFromImages(['path/to/image1.jpg', 'path/to/image2.jpg' ... ]);
```
For html block - use loadFromHtml
```js
pageFlip.loadFromHtml(items);
```
For example:
```html
<div id="book">
    <div class="my-page">
        Page one
    </div>
    <div class="my-page">
        Page two
    </div>
    <div class="my-page">
        Page three
    </div>
    <div class="my-page">
        Page four
    </div>
</div>
```
```js
const pageFlip = new PageFlip(document.getElementById('book'),
    {
        width: 400, // required parameter - base page width
        height: 600  // required parameter - base page height
    }
);

pageFlip.loadFromHTML(document.querySelectorAll('.my-page'));
```
### Config

Configuration is set when creating an object. Config parameters:

* width: number - required
* height: number - required
* size: ("fixed", "stretch") - default: "fixed". Whether the book will be stretched under the parent element
* minWidth, maxWidth, minHeight, maxHeight: number. You must set threshold values ​​with a size: "stretch"
* drawShadow: bool - default: true. Draw shadows or not
* flippingTime: number (milliseconds) - default: 1000. Flipping animation time
* usePortrait: bool - default: true. Enable switching to portrait mode
* startZIndex: number - default: 0. Initial value to z-index
* autoSize: bool - default: true. If this value is true, the parent element will be equal to the size of the book
* maxShadowOpacity: number [0..1] - default: 1. Shadow intensity - 1: max intensity, 0: hidden shadows

### Config
To listen for events using the method on:
```js
pageFlip.on('eventName', (e) => {
        // callback code
    }
);
```
Available events:
* flip: number - triggered by page turning
* changeOrientation: ("portrait", "landscape") - triggered when page orientation changes
* changeState: ("user_fold", "fold_corner", "flipping", "read") - triggered when the state of the book changes

Event object has two field: data and object

### METHOD
* getPageCount: number - Get the number of all pages
* getCurrentPageIndex: number - Get current page number (starts at 0)
* turnToPage(pageNum: number)	- Turns over the page to the specified number (without animation)
* turnToNextPage() - Turn to the next page (without animation)
* turnToPrevPage() - Turn to the previous page (without animation)
* flipNext(corner: 'top' | 'bottom') - Turn to the next page (with animation)
* flipPrev(corner: 'top' | 'bottom') - Turn to the previous page (with animation)
* loadFromImages(images: ['path-to-image'...]) - Loading page from images
* loadFromHtml(items: NodeListOf | HTMLElement[]) -	Loading page from html elements

### CONTACTS
Oleg,

<oleg.litovski9@gmail.com>

https://github.com/Nodlik/StPageFlip
