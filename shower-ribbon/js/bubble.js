var $currentSlide;

$(window).on('ChangeSlide', function (evt, number) {
    $currentSlide = $slides.eq(number);

    var $innerContainer = $currentSlide.find('.js-example24');

    if($innerContainer.length) {
        startExample24();
        
    } else {
        $.Window.trigger('stopExample24');
    }
});


function startExample24() {
    var $container = $('.Container24');
    var $objs;
    var hoverClass = 'Bubble--hovered';

    var objs = [];
    var lenObjs = 14;
    var maxRadius = 130;
    var minRadius = 80;
    var mass = 1;
    var keLoss = 1;

    var walls = [];

    var winW = 1024;
    var winH = 640;
    var t0 = 0;
    var dt;

    init();

    $.Window.on('stopExample24', function () {
        stopAnimate();
    });

    function init() {
        createBubbles();
        createWalls();

        events();

        t0 = new Date().getTime();
        startAnim();
    }

    function events() {
        $objs = $('.Bubble');
        var i = 1;
        var timer;

        $objs.hover(function () {
            var $obj = $(this);

            i += 1;

            timer = setTimeout(function () {
                $obj.addClass(hoverClass);
                $obj.css({
                    zIndex: i
                });
            }, 100);

        }, function () {
            clearTimeout(timer);
            $(this).removeClass(hoverClass);
        });
    }

    function createBubbles() {
        var $obj;
        var obj;
        var radius;
        var imgUrl;

        $('.Bubble').remove();

        for (var i = 0; i < lenObjs; i++) {
            $obj = $('<div class="Bubble"></div>');
            radius = getRandomInt(minRadius, maxRadius);

            $obj.append('<img class="Bubble-image" src="pictures/bubble/' + (i + 1) + '.png"/>')

            // Рисуем объект
            obj = new Obj({
                $el: $obj,
                mass: mass,
                radius: radius
            });

            obj.pos = new Vector(Math.random() * (winW - 2 * obj.radius) + obj.radius,
                                 Math.random() * (winH - 2 * obj.radius) + obj.radius);

            obj.velo = new Vector((Math.random() * 30), (Math.random() * 30));

            $container.append($obj);
            $obj
                .width(obj.diameter)
                .height(obj.diameter);

            $obj.css({
                top: -obj.radius,
                left: -obj.radius,
                backgroundImage: imgUrl
            });

            obj.changeStyles();
            objs.push(obj);
        }
    }

    function createWalls() {
        var wall1 = new Floor({b1: new Vector(0, 0), b2: new Vector(winW, 0)});
        walls.push(wall1);

        var wall2 = new Floor({b1: new Vector(winW, 0), b2: new Vector(winW, winH)});
        walls.push(wall2);

        var wall3 = new Floor({b1: new Vector(0, winH), b2: new Vector(winW, winH)});
        walls.push(wall3);

        var wall4 = new Floor({b1: new Vector(0, 0), b2: new Vector(0, winH)});
        walls.push(wall4);

        var wall5 = new Floor({b1: new Vector(353, 0), b2: new Vector(0, 353)});
        walls.push(wall5);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function startAnim() {
        animId = requestAnimationFrame(startAnim);
        onTimer();
    }

    function stopAnimate() {
        cancelAnimationFrame(animId);
    }

    function onTimer() {
        var t1 = new Date().getTime();
        dt = 0.001 * (t1 - t0);
        t0 = t1;
        if (dt > 0.2) {
            dt = 0;
        };

        move();
    }

    function move() {
        for (var i = 0; i < lenObjs; i++){
            var obj = objs[i];
            moveObject(obj);
        }
        checkCollision();
    }

    function moveObject(obj) {
        obj.pos = obj.pos.addScaled(obj.velo, dt);
        obj.changeStyles();
    }

    function checkCollision() {
        for (var i = 0; i < objs.length; i++){
            var obj = objs[i];
            checkWallBounce(obj);
        }
    }

    function checkWallBounce(obj) {
        var hasHitAWall = false;

        for (var i = 0; (i < walls.length && hasHitAWall == false); i++){
            var floor = walls[i];
            var fdispl = floor.displ;
            var fdisplLen = fdispl.length();

            var objb1 = floor.b1.subtract(obj.pos);
            var objb2 = floor.b2.subtract(obj.pos);

            var projb1 = objb1.projection(fdispl);
            var projb2 = objb2.projection(fdispl);
            var fdisplVec = fdispl.transfer(projb1);

            var dist = objb1.subtract(fdisplVec);
            var distLen = dist.length();

            var test = ((Math.abs(projb1) < fdisplLen) && (Math.abs(projb2) < fdisplLen));

            if ((distLen < obj.radius) && test) {
                var angle = Vector.angleBetween(obj.velo, fdispl);
                var loc = dist.dotProduct(obj.velo);
                var n = (loc > 0) ? -1 : 1;

                var deltaS = (obj.radius + distLen * n) / Math.sin(angle);

                var deltaSVec = obj.velo.unit();
                deltaSVec.scaleBy(deltaS);

                obj.pos = obj.pos.subtract(deltaSVec);

                var vcor = 1 - dist.dotProduct(deltaSVec) / obj.velo.lengthSquared();
                var Velo = obj.velo.multiply(vcor);

                var veloProjToDist = Velo.projection(dist);

                var normalVelo = dist.transfer(veloProjToDist);
                var tangentVelo = Velo.subtract(normalVelo);
                obj.velo = tangentVelo.addScaled(normalVelo, -keLoss);
            }
        }
    }
}