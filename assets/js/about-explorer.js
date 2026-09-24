(function () {
  var DEFAULT_SECTION = "kudoro";
  var root = document.querySelector("[data-about-explorer]");
  if (!root) return;

  var buttons = Array.prototype.slice.call(
    root.querySelectorAll("[data-section]")
  );
  var panels = Array.prototype.slice.call(
    root.querySelectorAll("[data-section-panel]")
  );

  var sectionIds = buttons.map(function (btn) {
    return btn.getAttribute("data-section");
  });

  var selectedSection = DEFAULT_SECTION;

  function isValidSection(id) {
    return sectionIds.indexOf(id) !== -1;
  }

  function getHashSection() {
    var hash = window.location.hash.replace(/^#/, "");
    return isValidSection(hash) ? hash : null;
  }

  function setHash(sectionId) {
    var next = "#" + sectionId;
    if (window.location.hash === next) return;
    if (window.history.replaceState) {
      window.history.replaceState(null, "", next);
    } else {
      window.location.hash = sectionId;
    }
  }

  function processEmbeds() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }

  function buildInstagramBlockquote(permalink, label) {
    var linkText = label || "View this post on Instagram";
    return (
      '<blockquote class="instagram-media" data-instgrm-permalink="' +
      permalink +
      '" data-instgrm-version="14">' +
      '<a href="' +
      permalink +
      '" target="_blank" rel="noopener noreferrer">' +
      linkText +
      "</a></blockquote>"
    );
  }

  function buildYoutubeIframe(videoId, label) {
    var title = label || "YouTube video";
    return (
      '<iframe src="https://www.youtube.com/embed/' +
      videoId +
      '" title="' +
      title +
      '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
    );
  }

  function buildDriveIframe(fileId, label) {
    var title = label || "Google Drive video";
    return (
      '<iframe src="https://drive.google.com/file/d/' +
      fileId +
      '/preview" title="' +
      title +
      '" loading="lazy" allow="autoplay" allowfullscreen></iframe>'
    );
  }

  function stopEmbeds(panel) {
    Array.prototype.forEach.call(
      panel.querySelectorAll(
        "[data-instagram-permalink], [data-youtube-id], [data-drive-id]"
      ),
      function (container) {
        container.innerHTML = "";
      }
    );
  }

  function startEmbeds(panel) {
    Array.prototype.forEach.call(
      panel.querySelectorAll("[data-instagram-permalink]"),
      function (container) {
        var permalink = container.getAttribute("data-instagram-permalink");
        var label = container.getAttribute("data-instagram-label");
        if (!permalink) return;
        if (container.querySelector("iframe")) return;
        container.innerHTML = buildInstagramBlockquote(permalink, label);
      }
    );
    Array.prototype.forEach.call(
      panel.querySelectorAll("[data-youtube-id]"),
      function (container) {
        var videoId = container.getAttribute("data-youtube-id");
        var label = container.getAttribute("data-youtube-label");
        if (!videoId) return;
        if (container.querySelector("iframe")) return;
        container.innerHTML = buildYoutubeIframe(videoId, label);
      }
    );
    Array.prototype.forEach.call(
      panel.querySelectorAll("[data-drive-id]"),
      function (container) {
        var fileId = container.getAttribute("data-drive-id");
        var label = container.getAttribute("data-drive-label");
        if (!fileId) return;
        if (container.querySelector("iframe")) return;
        container.innerHTML = buildDriveIframe(fileId, label);
      }
    );
    window.requestAnimationFrame(function () {
      processEmbeds();
    });
  }

  function showPanel(sectionId) {
    var activePanel = null;
    panels.forEach(function (panel) {
      var match = panel.getAttribute("data-section-panel") === sectionId;
      if (match) {
        activePanel = panel;
        panel.removeAttribute("hidden");
        panel.removeAttribute("inert");
        panel.setAttribute("aria-hidden", "false");
      } else {
        panel.setAttribute("hidden", "");
        panel.setAttribute("inert", "");
        panel.setAttribute("aria-hidden", "true");
        stopEmbeds(panel);
      }
    });
    if (activePanel) {
      startEmbeds(activePanel);
    }
  }

  function updateSelectionUi() {
    buttons.forEach(function (btn) {
      var active = btn.getAttribute("data-section") === selectedSection;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.tabIndex = active ? 0 : -1;
    });
  }

  function select(sectionId) {
    if (!isValidSection(sectionId)) {
      sectionId = DEFAULT_SECTION;
    }
    selectedSection = sectionId;
    updateSelectionUi();
    showPanel(sectionId);
    setHash(sectionId);
  }

  function syncFromHash() {
    var fromHash = getHashSection();
    if (!fromHash) {
      selectedSection = DEFAULT_SECTION;
      updateSelectionUi();
      showPanel(selectedSection);
      setHash(DEFAULT_SECTION);
      return;
    }
    selectedSection = fromHash;
    updateSelectionUi();
    showPanel(selectedSection);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      select(btn.getAttribute("data-section"));
    });
  });

  root.addEventListener("keydown", function (event) {
    var current =
      document.activeElement &&
      document.activeElement.getAttribute &&
      document.activeElement.getAttribute("data-section")
        ? document.activeElement
        : root.querySelector(".about-explorer-icon.is-active");
    if (!current) return;

    var index = buttons.indexOf(current);
    if (index === -1) return;

    var nextIndex = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % buttons.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    var next = buttons[nextIndex];
    next.focus();
    select(next.getAttribute("data-section"));
  });

  window.addEventListener("hashchange", syncFromHash);
  window.addEventListener("popstate", syncFromHash);

  syncFromHash();
})();
