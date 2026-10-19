(function () {
  function fit(header) {
    var text = header.querySelector("[data-header-text]");
    var photo = header.querySelector("[data-header-photo]");
    if (!text || !photo) return;

    photo.style.width = "0px";
    var full = Math.round(text.getBoundingClientRect().height);
    var max = Math.round(header.getBoundingClientRect().width * 0.42);
    var height = full;
    if (max > 0 && height > max) height = max;
    if (height < 1) return;

    photo.style.width = height + "px";
    photo.style.height = height + "px";

    var wrapped = Math.round(text.getBoundingClientRect().height);
    if (wrapped > height) {
      height = max > 0 ? Math.min(wrapped, max) : wrapped;
      photo.style.width = height + "px";
      photo.style.height = height + "px";
    }
  }

  function fitAll() {
    document.querySelectorAll("[data-header-photo]").forEach(function (photo) {
      if (photo.parentElement) fit(photo.parentElement);
    });
  }

  function start() {
    fitAll();
    window.addEventListener("resize", fitAll);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAll);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
