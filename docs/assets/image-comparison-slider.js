function registerSlider(slider) {
    let left = slider.getElementsByClassName("cmp-left")[0];
    let right = slider.getElementsByClassName("cmp-right")[0];
    let divider = slider.getElementsByClassName("cmp-divider")[0];

    function update(e) {
        let {x, y, width} = slider.getBoundingClientRect();
        let sx = Math.max(0, Math.min(width-1, Math.round(e.clientX - x)));

        console.log(x, y, width, sx, e.clientX);

        left.style.width = sx + 'px';
        right.style.width = (width - sx) + 'px';
        divider.style.left = sx + 'px';
    }

    function onPointerDown(e) {
        update(e);
        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("pointermove", onPointerMove);
    }

    function onPointerMove(e) { 
        if (!(e.buttons & 1)) { return; } 
        update(e); 
    }

    function onPointerUp(e) {
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointermove", onPointerMove);
    }

    slider.addEventListener("pointerdown", onPointerDown);
}

function registerSliders() {
    let sliders = document.getElementsByClassName("cmp-slider");
    for (const slider of sliders) {
        registerSlider(slider);
    }
}

window.addEventListener("load", (e) => registerSliders());

