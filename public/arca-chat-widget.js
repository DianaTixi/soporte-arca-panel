(function () {
  if (window.ArcaChatWidget) return;

  function init(config) {
    var settings = Object.assign(
      {
        baseUrl: window.location.origin,
        token: "",
        contexto: "general",
        apiUrl: "",
        title: "Soporte ARCA",
        primaryColor: "#e91e63",
        position: "right",
        zIndex: 999999,
        startOpen: false,
      },
      config || {}
    );

    var side = settings.position === "left" ? "left" : "right";
    var open = !!settings.startOpen;
    var embedKey = Math.random().toString(36).slice(2, 12);

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.setAttribute("aria-label", settings.title);
    launcher.textContent = "💬";
    launcher.style.position = "fixed";
    launcher.style[side] = "20px";
    launcher.style.bottom = "20px";
    launcher.style.width = "56px";
    launcher.style.height = "56px";
    launcher.style.border = "none";
    launcher.style.borderRadius = "999px";
    launcher.style.cursor = "pointer";
    launcher.style.background = settings.primaryColor;
    launcher.style.color = "#fff";
    launcher.style.fontSize = "24px";
    launcher.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
    launcher.style.zIndex = String(settings.zIndex);

    var frame = document.createElement("iframe");
    var src =
      settings.baseUrl.replace(/\/$/, "") +
      "/embed/chat?" +
      new URLSearchParams({
        contexto: settings.contexto || "general",
        apiUrl: settings.apiUrl || "",
        embedKey: embedKey,
      }).toString();

    frame.src = src;
    frame.title = settings.title;
    frame.style.position = "fixed";
    frame.style[side] = "20px";
    frame.style.bottom = "88px";
    frame.style.width = "380px";
    frame.style.maxWidth = "calc(100vw - 24px)";
    frame.style.height = "620px";
    frame.style.maxHeight = "calc(100vh - 110px)";
    frame.style.border = "1px solid rgba(0,0,0,.12)";
    frame.style.borderRadius = "16px";
    frame.style.background = "#fff";
    frame.style.boxShadow = "0 20px 60px rgba(0,0,0,.25)";
    frame.style.overflow = "hidden";
    frame.style.display = open ? "block" : "none";
    frame.style.zIndex = String(settings.zIndex);

    frame.addEventListener("load", function () {
      frame.contentWindow?.postMessage({
        type: "arca:embed:init",
        embedKey: embedKey,
        token: settings.token || "",
      }, "*");
    });

    launcher.addEventListener("click", function () {
      open = !open;
      frame.style.display = open ? "block" : "none";
      launcher.textContent = open ? "✕" : "💬";
    });

    launcher.textContent = open ? "✕" : "💬";

    document.body.appendChild(frame);
    document.body.appendChild(launcher);

    return {
      destroy: function () {
        frame.remove();
        launcher.remove();
      },
      open: function () {
        open = true;
        frame.style.display = "block";
        launcher.textContent = "✕";
      },
      close: function () {
        open = false;
        frame.style.display = "none";
        launcher.textContent = "💬";
      },
    };
  }

  window.ArcaChatWidget = { init: init };
})();
