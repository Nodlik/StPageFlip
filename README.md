# StPageFlip
Powerful, simple, and flexible JS Library for creating realistic and beautiful page turning effect.

![](https://nodlik.github.io/StPageFlip/images/video.gif)

### Features
* Works with simple images on canvas and complex HTML blocks
* Has simple API and flexible configuration
* Compatible with mobile devices
* Supports landscape and portrait screen mode
* Supports soft and hard page types (only in HTML mode) 
* No dependencies

Demo and docs: https://nodlik.github.io/StPageFlip/

### Installation
You can install the latest version using npm:

```npm install page-flip```

Or download bundle from Github

### Usage

If you've installed the package from npm, you should import PageFlip from page-flip package, or just use ```<script/>``` tag:

```html
<script src="{path/to/scripts}/page-flip.browser.js"></script>
```

To create a new PageFlip object:
```js
import {PageFlip} from 'page-flip';

const pageFlip = new PageFlip(htmlParentElement, settings);

// or if you're using a script tag and page-flip.browser.js:
const pageFlip = new St.PageFlip(htmlParentElement, settings);
```

```htmlParentElement - HTMLElement```- root element, where the book will be created

```settings: object``` - configuration object.

To draw on a canvas, use ```loadFromImages```:
```js
pageFlip.loadFromImages(['path/to/image1.jpg', 'path/to/image2.jpg' ... ]);
```
To load page from html elements - use ```loadFromHtml```:
```js
pageFlip.loadFromHtml(items);
```
For example:
```html
<div id="book">
    <div class="my-page" data-density="hard">
        Page Cover
    </div>
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
    <div class="my-page" data-density="hard">
        Last page
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
Use ```data-density="hard"``` attribute to specify page type (```soft | hard```) and define flipping animation.
### Config

To set configuration define these parameters when creating an object::

* ```width: number``` - required
* ```height: number``` - required
* ```size: ("fixed", "stretch")``` - default: ```"fixed"``` Whether the book will be stretched under the parent element or not
* ```minWidth, maxWidth, minHeight, maxHeight: number``` You must set threshold values ​​with size: ```"stretch"```
* ```drawShadow: bool``` - default: ```true``` Draw shadows or not when page flipping
* ```flippingTime: number``` (milliseconds) - default: ```1000``` Flipping animation time
* ```usePortrait: bool``` - default: ```true``` Enable switching to portrait mode
* ```startZIndex: number``` - default: ```0``` Initial value to z-index
* ```autoSize: bool``` - default: ```true``` If this value is true, the parent element will be equal to the size of the book
* ```maxShadowOpacity: number [0..1]``` - default: ```1``` Shadow intensity (1: max intensity, 0: hidden shadows)
* ```showCover: boolean``` - default: ```false``` If this value is true, the first and the last pages will be marked as hard and will be shown in single page mode 
* ```mobileScrollSupport: boolean``` - default: ```true``` isable content scrolling when touching a book on mobile devices
### Events
To listen events use the method ```on```:
```js
pageFlip.on('flip', (e) => {
        // callback code
        alert(e.data); // current page number
    }
);
```
Available events:
* ```flip: number``` - triggered by page turning
* ```changeOrientation: ("portrait", "landscape")``` - triggered when page orientation changes
* ```changeState: ("user_fold", "fold_corner", "flipping", "read")``` - triggered when the state of the book changes

Event object has two fields: ```data: number | string``` and ```object: PageFlip```

### Methods
* ```getPageCount: number``` - Get number of all pages
* ```getCurrentPageIndex: number``` - Get the current page number (starts at 0)
* ```turnToPage(pageNum: number)``` - Turn to the specified page number (without animation)
* ```turnToNextPage()``` - Turn to the next page (without animation)
* ```turnToPrevPage()``` - Turn to the previous page (without animation)
* ```flipNext(corner: 'top' | 'bottom')``` - Turn to the next page (with animation)
* ```flipPrev(corner: 'top' | 'bottom')``` - Turn to the previous page (with animation)
* ```flip(pageNum: number, corner: 'top' | 'bottom')``` - Turn to the specified page (with animation)
* ```loadFromImages(images: ['path-to-image1.jpg', ...])``` - Load page from images
* ```loadFromHtml(items: NodeListOf | HTMLElement[])``` -	Load page from html elements

### Contacts
Oleg,

<oleg.litovski9@gmail.com>

https://github.com/Nodlik/StPageFlip
