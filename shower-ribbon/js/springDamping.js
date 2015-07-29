var $currentSlide;

$(window).on('ChangeSlide', function (evt, number) {
    $currentSlide = $slides.eq(number);

    var $innerContainer = $currentSlide.find('.js-example6');

    if($innerContainer.length) {
        startExample6();
        
    } else {
        $.Window.trigger('stopExample6');
    }
});


function startExample6() {
    var $obj = $('.ball6');
    var $center = $('.center6');

    var obj;
    var winW = 1024;
    var winH = 640;
    var center = new Vector(0.5 * winW, 0.5 * winH);
    var obj;
    var displ;
    var m = 1;
    var kSpring = 10;
    var t0;
    var dt;
    var acc;
    var force;
    var animId;
    var cDamping = 0.7;

    init();
    $.Window.on('stopExample6', function () {
        stopAnimate();
    });

    function init() {
        obj = new Obj({
            $el: $obj,
            mass: m
        });
        obj.pos = new Vector(200, 200);
        obj.velo = new Vector(0, 0);

        t0 = new Date().getTime();
        obj.changeStyles();
        animFrame();
    };

    function animFrame() {
        animId = requestAnimationFrame(animFrame);
        onTimer();
    }
    function onTimer() {
        dt = 0.016; /* По сути время представляет собой константу,
                      которая при стабильной работе компьютера, без задержек равна примерно 17 = 1000/60 (60 кадров в секунду).
                      Т.е. величина как мы видим постоянная. В примерах взято число, т.к. если вдруг компьютер не стабилен, то при
                      четком расчете времени анимация прыгает, а если число, то она просто задерживается (тоже не хорошо, но выглядет менее заметно). В примере 01_movingBall
                      показан в комментариях также код рассчета времени */
        move();
    }
    function move() {
        moveObject();
        calcForce();
        updateAccel();
        updateVelo();
    }

    function moveObject() {
        obj.pos = obj.pos.addScaled(obj.velo, dt);
        obj.changeStyles();
    }
    function calcForce() {
        displ = obj.pos.subtract(center);

        var restoring = displ.multiply(-kSpring);
        var damping = obj.velo.multiply(-cDamping);

        obj.force = Vector.add([restoring, damping]);
    }
    function updateAccel() {
        acc = obj.force.multiply(1 / m);
    }
    function updateVelo() {
        obj.velo = obj.velo.addScaled(acc, dt);
    }

    function stopAnimate() {
        cancelAnimationFrame(animId);
    }
}