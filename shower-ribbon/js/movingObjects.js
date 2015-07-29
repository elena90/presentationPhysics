var $currentSlide;

$(window).on('ChangeSlide', function (evt, number) {
    $currentSlide = $slides.eq(number);

    var $innerContainer = $currentSlide.find('.js-example10');

    if($innerContainer.length) {
        startExample10();
        
    } else {
        $.Window.trigger('stopExample10');
    }
});


function startExample10() {
    var $body = $('.container10');
    var $container = $('.SquaresCollapse');
    var $objs;

    var sizeEl = 40;
    var objs = [];
    var animId;
    var allInHome;
    var cursorForceZoomed = 50000;
    var damping = 0.85;
    var inHome = 0;
    var m = 1;
    var kSpring = 1;
    var acc;
    var dt;

    var displObj;
    var displCursor;
    var homeSin;
    var homeCos;
    var homeForce;
    var homeDistance;
    var homeDistanceReverse;
    var cursorForce;
    var cursorDistance;

    var cursorPos = new Vector(-1, -1);

    var winW = 1024;
    var winH = 640;
    var t0 = 0;

    var scale = ($.Body.attr('style')) ? parseFloat($.Body.attr('style').match(/[+-]?\d+(\.\d+)?/)[0]) : 1;

    events();

    function events() {
        startMove();
    }

    function clearAndCreateEls() {
        $container.empty();
        $body.off('mousemove');
        $body.off('mouseleave');
        stopAnimate();
    }

    function startMove() {
        createEls();

        $body
            .on('mousemove', mouseMove)
            .on('mouseleave', mouseEnd);

        $.Window.on('stopExample10', function () {
                clearAndCreateEls();
            });

        animFrame();
    }

    function createEls() {
        objs = [];

        var hEl = sizeEl;
        var wEl = sizeEl;
        var lenW = winW / wEl + 1;
        var lenH = winH / hEl + 1;
        var num = 0;

        for (var i = 0; i < lenW; i++) {
            for (var j = 0; j < lenH; j++) {
                var $obj = $('<div class="SquaresCollapse-item" style="width: ' + hEl + 'px; height: ' + wEl + 'px;"></div>');

                var x = wEl * i;
                var y = hEl * j;

                $container.append($obj);

                // Задаем объект и рисуем положение объекта
                var newObj = new Obj({$el: $obj});
                newObj.pos = new Vector(x, y);
                newObj.home = new Vector(x, y);
                newObj.velo = new Vector(0, 0);
                newObj.changeStyles();
                newObj.force = new Vector(0, 0);
                newObj.acc = new Vector(0, 0);

                objs.push(newObj);
            }
        }

        $objs = $container.find('.Squires-item');
    }

    function mouseMove(evt) {
        var displ = new Vector(($.Window.width() - (winW * scale))/2, ($.Window.height() - (winH * scale))/2);

        cursorPos = new Vector((evt.pageX - displ.x) / scale, (evt.pageY - displ.y) / scale );
        allInHome = false;
    }

    function mouseEnd() {
        cursorPos = new Vector(-1, -1);
        allInHome = false;
    }

    function animFrame() {
        animId = requestAnimationFrame(animFrame);
        onTimer();
    }

    function stopAnimate() {
        cancelAnimationFrame(animId);
    }

    function start() {
        if (timer) {
            return;
        }

        animFrame();
    }

    function move() {
        inHome = 0;

        for (var i = objs.length; i--;) {
            var obj = objs[i];

            calcForce(obj);
            updateAccel(obj);
            updateVelo(obj);
            moveObjs(obj);
            checkObj(obj);
        }

        allInHome = inHome == objs.length;
    }

    function onTimer() {
        if (!objs || objs.length == 0) {
            return;
            stopAnimate();
        }
        if (!allInHome) {
            dt = 0.18; /* По сути время представляет собой константу,
                      которая при стабильной работе компьютера, без задержек равна примерно 17 = 1000/60 (60 кадров в секунду).
                      Т.е. величина как мы видим постоянная. В примерах взято число, т.к. если вдруг компьютер не стабилен, то при
                      четком расчете времени анимация прыгает, а если число, то она просто задерживается (тоже не хорошо, но выглядет менее заметно). В примере 01_movingBall
                      показан в комментариях также код рассчета времени */
            move();
        }
    }

    function moveObjs(obj) {
        obj.pos = obj.pos.addScaled(obj.velo, dt);

        // Обновление стилей
        obj.changeStyles();
    }

    function calcForce(obj) {
        displObj = obj.pos.subtract(obj.home);

        cursorForce = new Vector(0, 0);

        if (cursorPos.x >= 0) {
            displCursor = obj.pos.subtract(cursorPos);
            cursorDistance = displCursor.length();
            if (cursorDistance > 1 && cursorDistance <= cursorForceZoomed) {
                cursorForce = displCursor.multiply(cursorForceZoomed / (cursorDistance * cursorDistance));
            }
        }

        // Обновление скорости
        var restoring = displObj.multiply(-kSpring);
        var damping = obj.velo.multiply(-0.9);
        obj.force = Vector.add([restoring, cursorForce, damping]);
    }

    function updateAccel(obj) {
        obj.acc = obj.force.multiply(1 / m);
    }

    function updateVelo(obj) {
        obj.velo = obj.velo.addScaled(obj.acc, dt);
        // obj.velo = obj.velo.multiply(damping);
    }

    function checkObj(obj) {
        if (Math.abs(obj.x) < 0.5 &&
            Math.abs(obj.y) < 0.5 &&
            Math.abs(obj.vx) < 0.5 &&
            Math.abs(obj.vy) < 0.5) {

            obj.velo = new Vector(0, 0);
            obj.pos = new Vector(obj.hx, obj.hy);
            inHome++;
        }
    }
}