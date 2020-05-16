<!doctype html>
<html lang="RU">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width">

    <link href="css/assets.min.css" rel="stylesheet">
    <link href="css/app.css" rel="stylesheet">

    <meta name="keywords" content="">
    <meta name="description" content="">

    <title>StPageFlip Demo</title>

    <style>
    </style>
</head>
<body>

<div id="wrapper" style="">

    <div id="book"></div>

    <div style="text-align: center">
        Page: <span class="data__currentPage"></span> of <span class="data__total"></span>
    </div>

</div>

</body>
<script src="js/stPageFlip.bundle.js"></script>

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        const app = new StPageFlip.App(document.getElementById('book'));

        const pageBlock = document.querySelector('.data__currentPage');
        app.on('flip', (e) => {
            const page = e.data + 1;
            pageBlock.innerHTML = page + ' - ' + (page + 1);
        });

        app.loadFromImages([
            'images/0.jpg',
            'images/1.jpg',
            'images/1-2.jpg',
            'images/1-2_.jpg',
            'images/2.jpg',
            'images/3.jpg',
            'images/4.jpg',
            'images/5.jpg',
            'images/3-4.jpg',
            'images/3-4_.jpg',
            'images/6.jpg',
            'images/7.jpg',
            'images/8.jpg',
            'images/9.jpg',
        ]);

        document.querySelector('.data__total').innerHTML = app.getPageCount();
    });
</script>

</html>
