function resize() {
    root.overrideBounds({
        width : Math.max(window.innerWidth - 20, root.bounds.width),
        height : Math.max(window.innerHeight - 20, root.bounds.height)
    });

    jQuery('svg').attr(root.bounds);
}

function redraw() {
    root.draw(d3.select('svg'));
    resize();
}

window.onresize = window.onload = resize;