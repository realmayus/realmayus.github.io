const active_bullet_limit = 25;
const active_enemy_limit = 1000;
let game_loop_id;
let starshipLeft;
let starshipTop;
let enemy;
let enemyList = [];
let score = 0;
let keys = {};
let health = 100.0;
let wave = 1;
let wave_ongoing = true;
let wave_enemies_spawned = 0;

function start_game() {
    let keys = {};

    $('#starship').css({
        top: "50vh",
        left: "50vw"
        }
    );

    health = 100;

    console.log("Started Game!");
    document.getElementById("start_game_btn").classList.toggle("hidden"); //make invisible
    document.getElementById("exit_game_btn").classList.toggle("hidden"); //make visible
    document.getElementById("healthlabel").classList.toggle("hidden"); //make visible
    document.getElementById("health").classList.toggle("hidden"); //make visible
    document.getElementById("score").classList.toggle("hidden"); //make visible

    document.getElementById("enemies").classList.toggle("hidden"); //make visible
    document.getElementById("wave").classList.toggle("hidden"); //make visible

    document.getElementById("howtoplay").classList.toggle("hidden"); //make invisible

    document.getElementById("body").classList.toggle("game_active"); //change colorscheme
    document.getElementById("exit_game_btn").classList.toggle("game_active"); //change colorscheme
    document.getElementById("starship").classList.toggle("hidden"); //make visible


    game_loop_id = setInterval(game_loop, 30);  // start game at 30 FPS

}

function exit_game() {
    location.reload();
}

$(document).keydown(function (e) {
    keys[e.which] = true;
});

$(document).keyup(function (e) {
    delete keys[e.which];
});

function game_loop() {

    document.getElementById('wave').innerText = "Wave: " + wave;


    move_starship(keys);

    let pos = $('#starship').offset();
    starshipLeft = pos.left;

    starshipTop = pos.top;


    for(enemy of enemyList) {
        control_enemy(enemy);
    }

    if(wave_enemies_spawned >= wave * 5) {
        wave_enemies_spawned = 0;
        wave_ongoing = false;
        document.getElementById('enemies').innerText = "Next wave in 5 seconds";

        setTimeout(schedule_new_wave, 5000);
    } else {
        document.getElementById('enemies').innerText = "Invaders: " + wave_enemies_spawned + "/" + (wave*5);
    }

    if(wave_ongoing) {
        if(Math.round(Math.random()*100) === 69) { // nice.
            spawn_enemy(starshipTop, 10, 10 * wave);
            wave_enemies_spawned++;
        }
    }

    for(enemy of enemyList) {
        if(Math.round(Math.random()*10) === 8) {
            render_enemy_bullet($(enemy).offset().left, $(enemy).offset().top);
        }
    }
    document.getElementById('score').innerText = "Score: " + score;

    document.getElementById('health').value = health;

    if(health <= 0) {
        alert("Game over! Score: " + score);
        exit_game();
    }
}

function schedule_new_wave() {
    console.log("scheduled new wave!");
    wave_ongoing = true;
    wave++;
}

function move_starship() {

    let key = "";
    for(key in keys) {
        switch (key) {

            // left arrow pressed
            case "37":
                var pos = $('#starship').offset();
                if(pos.left >= 0) {
                    $('#starship').css({
                        position:'absolute',
                        left: pos.left - 30
                    });
                }
                break;
            // up arrow pressed
            case "38":
                var pos = $('#starship').offset();
                if(pos.top >= 0) {
                    $('#starship').css({
                        position:'absolute',
                        top: pos.top - 30
                    });
                }

                break;
            // right arrow pressed
            case "39":

                var pos = $('#starship').offset();
                if(pos.left  <= window.innerWidth - 35) {
                    $('#starship').css({
                        position:'absolute',
                        left: pos.left + 15
                    });
                }

                break;
            // down arrow pressed
            case "40":
                var pos = $('#starship').offset();
                if(pos.top <= window.innerHeight - 25) {
                    $('#starship').css({
                        position:'absolute',
                        top: pos.top + 15
                    });
                }
                break;

            case "32":
                var pos = $('#starship').offset();
                render_bullet(pos.left, pos.top);
        }
    }
}

function render_bullet(startX, startY) {
    if(document.getElementsByClassName("bullet").length < active_bullet_limit) {
        let div = document.createElement("DIV");
        div.classList.add("bullet");
        div.style.position = "absolute";
        div.style.width = "10px";
        div.style.height = "5px";
        div.style.top = startY + "px";
        div.style.left = startX + "px";
        div.style.backgroundColor = "#fff";

        document.body.appendChild(div);

        let left = $( div ).offset().left;

        $( div ).css({left:left}).animate({"left":"120vw"}, "slow");
        let check_interval = setInterval(function () { check_bullet_collision(div) }, 20);

        setTimeout(function () {
            delete_bullet(div);
            clearInterval(check_interval);
        }, 2000);
    }
}



function render_enemy_bullet(startX, startY) {
    if(document.getElementsByClassName("bullet_enemy").length < active_bullet_limit) {
        let div = document.createElement("DIV");
        div.classList.add("bullet_enemy");
        div.style.position = "absolute";
        div.style.width = "10px";
        div.style.height = "5px";
        div.style.top = startY + "px";
        div.style.left = startX + "px";
        div.style.backgroundColor = "rgb(255, 0, 0)";
        document.body.appendChild(div);

        let left = $( div ).offset().left;

        $( div ).css({left:left}).animate({"left":"-30px"}, "slow");
        let check_interval = setInterval(function () { check_enemy_bullet_collision(div) }, 20);

        setTimeout(function () {
            delete_bullet(div);
            clearInterval(check_interval);
        }, 2000);
    }
}

function check_bullet_collision(element) {
    let bulletPos = $( element ).offset();
    for(enemy of enemyList) {
        let enemypos = $(enemy).offset();
        if(bulletPos.left >= enemypos.left && bulletPos.left <= enemypos.left + 30 && bulletPos.top >= enemypos.top && bulletPos.top <= enemypos.top + 30) {
            delete_enemy(enemy);
            delete_bullet(element);
            score += 1;
        }
    }
}

function check_enemy_bullet_collision(element) {
    let bulletPos = $( element ).offset();

    if(bulletPos.left <= starshipLeft && bulletPos.left >= starshipLeft - 25 && bulletPos.top >= starshipTop && bulletPos.top <= starshipTop + 25) {
        health -= 0; //TODO
    }
}

function delete_bullet(element) {
    document.body.removeChild(element);
}

function delete_all_bullets() {
    for(let bullet in document.getElementsByClassName('bullet')) {
        document.body.removeChild(bullet);
    }

    for(let bullet in document.getElementsByClassName('bullet_enemy')) {
        document.body.removeChild(bullet);
    }
}

function spawn_enemy(startY, startX, damage) {
    if(enemyList.length < active_enemy_limit) {
        var div = document.createElement("DIV");
        div.classList.add("enemy");
        div.style.position = "absolute";
        div.style.width = "30px";
        div.style.height = "30px";
        div.style.top = startY + "px";
        div.style.right = startX + "px";
        div.style.backgroundColor = "rgb(234, " + get_red_tone(damage) + ", " + get_red_tone(damage) + ")";

        document.body.appendChild(div);
        enemyList.push(div);
    }
}

function get_red_tone(damage) {
    return 255 * Math.pow(1.05, -damage);
}

function control_enemy(element) {
    $(element).animate({"left": (starshipLeft + 150) + "px", "top": starshipTop + "px"}, 50);
}

function delete_enemy(element) {
    document.body.removeChild(element);
    enemyList.splice(enemyList.indexOf(element), 1);
}

function clear_enemies() {
    for (var j = 0; j < 5; j++) {
        for (var i = 0, length = enemyList.length; i < length; i++) {
            document.body.removeChild(enemyList[i]);
            enemyList.splice(i, 1);
        }
    }
}
