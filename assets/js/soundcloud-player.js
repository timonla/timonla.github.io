(() => {
  const initPlayers = () => {
    const players = document.querySelectorAll("[data-soundcloud-player]");

    if (!players.length || !window.SC?.Widget) {
      return;
    }

    let activeWidget = null;

    const formatTime = (milliseconds) => {
      if (!Number.isFinite(milliseconds)) {
        return "--:--";
      }

      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      return `${minutes}:${seconds}`;
    };

    players.forEach((player) => {
      const iframe = player.querySelector(".unreleased-track-widget");
      const toggle = player.querySelector(".unreleased-track-toggle");
      const icon = toggle.querySelector("i");
      const progress = player.querySelector(".unreleased-track-progress");
      const elapsed = player.querySelector("[data-elapsed]");
      const durationLabel = player.querySelector("[data-duration]");
      const trackTitle = iframe.title.replace(" SoundCloud player", "");
      const widget = window.SC.Widget(iframe);

      let duration = 0;
      let seeking = false;

      const setPlaying = (isPlaying) => {
        icon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
        toggle.setAttribute(
          "aria-label",
          `${isPlaying ? "Pause" : "Play"} ${trackTitle}`
        );
      };

      const setProgress = (position, percentage) => {
        const value = Math.min(100, Math.max(0, percentage));

        if (!seeking) {
          progress.value = value;
          progress.style.setProperty("--progress", `${value}%`);
        }

        elapsed.textContent = formatTime(position);
      };

      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.getDuration((trackDuration) => {
          duration = trackDuration;
          durationLabel.textContent = formatTime(duration);
        });

        toggle.disabled = false;
        progress.disabled = false;
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => {
        if (activeWidget && activeWidget !== widget) {
          activeWidget.pause();
        }

        activeWidget = widget;
        setPlaying(true);
      });

      widget.bind(window.SC.Widget.Events.PAUSE, () => {
        setPlaying(false);
      });

      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setPlaying(false);
        setProgress(0, 0);
      });

      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (event) => {
        setProgress(event.currentPosition, event.relativePosition * 100);
      });

      toggle.addEventListener("click", () => {
        widget.isPaused((isPaused) => {
          if (isPaused) {
            widget.play();
          } else {
            widget.pause();
          }
        });
      });

      progress.addEventListener("input", () => {
        seeking = true;
        const percentage = Number(progress.value);
        progress.style.setProperty("--progress", `${percentage}%`);
        elapsed.textContent = formatTime((percentage / 100) * duration);
      });

      progress.addEventListener("change", () => {
        widget.seekTo((Number(progress.value) / 100) * duration);
        seeking = false;
      });
    });
  };

  if (window.SC?.Widget) {
    initPlayers();
    return;
  }

  window.addEventListener("load", initPlayers, { once: true });
})();
