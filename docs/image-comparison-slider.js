function registerSlider(slider) {
    let left = slider.getElementsByClassName("cmp-left")[0];
    let right = slider.getElementsByClassName("cmp-right")[0];
    let divider = slider.getElementsByClassName("cmp-divider")[0];

    let enabled = false;

    function update(e) {
        let {x, y, width} = slider.getBoundingClientRect();
        let sx = Math.floor(e.clientX - x);

        left.style.width = sx + 'px';
        right.style.width = (width - sx) + 'px';
        divider.style.left = sx + 'px';
    }

    slider.addEventListener("pointerup",    (e) => { enabled = false; });
    slider.addEventListener("pointerleave", (e) => { enabled = false; });
    slider.addEventListener("pointerdown",  (e) => { enabled = true; update(e); });
    slider.addEventListener("pointermove",  (e) => { if (!enabled) { return; } update(e); });
}

function registerSliders() {
    let sliders = document.getElementsByClassName("cmp-slider");
    for (const slider of sliders) {
        registerSlider(slider);
    }
}

window.addEventListener("load", (e) => registerSliders());

