function registerSlider(slider) {
    let left = slider.getElementsByClassName("cmp-left")[0];
    let right = slider.getElementsByClassName("cmp-right")[0];
    let divider = slider.getElementsByClassName("cmp-divider")[0];

    function update(e) {
        let {x, y, width} = slider.getBoundingClientRect();
        let sx = Math.floor(e.clientX - x);

        console.log(width);

        left.style.width = sx + 'px';
        right.style.width = (width - sx) + 'px';
        divider.style.left = sx + 'px';
    }

    slider.addEventListener("pointerdown", (e) => update(e));
    slider.addEventListener("pointermove", (e) => { if (!(e.buttons & 1)) { return; } update(e); });
}

function registerSliders() {
    let sliders = document.getElementsByClassName("cmp-slider");
    for (const slider of sliders) {
        registerSlider(slider);
    }
}

window.addEventListener("load", (e) => registerSliders());

