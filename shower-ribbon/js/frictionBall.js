var $currentSlide;

$(window).on('ChangeSlide', function (evt, number) {
    $currentSlide = $slides.eq(number);

    var $innerContainer = $currentSlide.find('.js-example2');

    if($innerContainer.length) {
        startExample2();
        
    } else {
        $.Window.trigger('stopExample2');
    }
});


function startExample2() {
    var $cont = $('.container2');
    var $obj = $('.ball2');
    var winW = $cont.width();
    var winH = $cont.height();
    var t0 = 0;

    var isDragging = false;

    var obj;
    var m = 1;
    var t;
    var t0;
    var pos0;
    var dt;
    var animId;

    var powerLossFactor = 4;
    var powerApplied = 50;
    var ke;
    var vmag;
    var mass;
    var scale;
    var isPositive = {
        x: false,
        y: false
    };

    init();

    $.Window.on('stopExample2', function () {
        stopAnimate();

        $obj.off('mousedown');
        $cont.add($obj).off('mouseup');
        $cont.add($obj).off('mousemove');
    });

    function init() {
        obj = new Obj({
            mass: m,
            $el: $obj,
            radius: 100
        });

        obj.pos = new Vector(0, 0);
        obj.velo = new Vector(0, 0);

        obj.changeStyles();

        mass = obj.mass;
        vmag = obj.velo;
        ke = new Vector(0.5 * mass * obj.vx * obj.vx, 0.5 * mass * obj.vy * obj.vy);

        t0 = new Date().getTime();

        $obj.on('mousedown', mouseDown);
        $cont.add($obj).on('mouseup', mouseUp);
        $cont.add($obj).on('mousemove', mouseMove);
    }

    function startAnim() {
        animId = requestAnimationFrame(startAnim);
        onTimer();
    }

    function stopAnimate() {
        cancelAnimationFrame(animId);
    }

    function onTimer() {
        dt = 0.017; /* По сути время представляет собой константу,
                      которая при стабильной работе компьютера, без задержек равна примерно 17 = 1000/60 (60 кадров в секунду).
                      Т.е. величина как мы видим постоянная. В примерах взято число, т.к. если вдруг компьютер не стабилен, то при
                      четком расчете времени анимация прыгает, а если число, то она просто задерживается (тоже не хорошо, но выглядет менее заметно). */

        // var t1 = new Date().getTime();
        // dt = t1 - t0;

        // dt = 0.017;
        // t0 = t1;

        // if (dt > 0.2) {
        //     dt = 0; // Фиксит баг когда переходим в другую вкладку.
        // }
        move();
    }

    function move() {
        moveObject();
        applyPower();
        updateVelo();
    }

    function moveObject() {
        obj.pos = obj.pos.addScaled(obj.velo, dt);

        checkObjPos();
        obj.changeStyles();
    }

    function applyPower() {
        var powerLoss = new Vector(-powerLossFactor * obj.vx * obj.vx * dt,
                                   -powerLossFactor * obj.vy * obj.vy * dt);
        ke = ke.add(powerLoss);

        if (Math.round(ke.x) <= 1 && Math.round(ke.y) <= 1) {
            stopAnimate();
        }
    }

    function updateVelo() {
        obj.velo = new Vector(Math.sqrt(2 * ke.x / mass), Math.sqrt(2 * ke.y / mass));
        obj.vy = (isPositive.y) ? obj.vy : -obj.vy;
        obj.vx = (isPositive.x) ? obj.vx : -obj.vx;
    }

    function mouseDown(evt) {
        stopAnimate();
        t0 = new Date().getTime();
        obj.pos0 = obj.pos;
        isDragging = true;
        scale = parseFloat($.Body.attr('style').match(/[+-]?\d+(\.\d+)?/)[0]);
        innerVector = new Vector(evt.offsetX, evt.offsetY);
    }

    function mouseUp() {
        if (!isDragging) {
            return false;
        }
        t1 = new Date().getTime();
        getVelo();
        isDragging = false;
    }

    function mouseMove(evt) {
        if (!isDragging) {
            return;
        }
        var displ = new Vector(($.Window.width() - (winW * scale))/2, ($.Window.height() - (winH * scale))/2);

        var oldPos = obj.pos;
        var mousePos = new Vector((evt.pageX - displ.x) / scale, (evt.pageY - displ.y) / scale );
        
        mousePos = mousePos.subtract(innerVector);
        // mousePos.x *= scale
        // mousePos = mousePos.multiply(scale);
        
        obj.pos = mousePos;
        
        checkObjPos();
        obj.changeStyles();
    }

    function getVelo() {
        var displ = obj.pos.subtract(obj.pos0);
        obj.velo = displ.divide((t1 - t0) * 0.001);

        t0 = new Date().getTime();

        setPositive();

        ke = new Vector(0.5 * obj.mass * obj.vx * obj.vx,
                        0.5 * obj.mass * obj.vy * obj.vy);
        startAnim();
    }

    // Для определения направления по осям.
    function setPositive() {
        if (obj.vy >= 0) {
            isPositive.y = true;
        } else {
            isPositive.y = false;
        }

        if (obj.vx >= 0) {
            isPositive.x = true;
        } else {
            isPositive.x = false;
        }
    }

    function checkObjPos() {
        obj.pos = obj.pos.setBoundaries({minX: 0, maxX: winW}, {minY: 0, maxY: winH}, obj.radius);
    }
}