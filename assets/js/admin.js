(function () {
  const loginPanel = document.getElementById("loginPanel");
  const dashboard = document.getElementById("dashboard");

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  const contentForm = document.getElementById("contentForm");
  const contentEditor = document.getElementById("contentEditor");
  const contentMessage = document.getElementById("contentMessage");

  const mediaForm = document.getElementById("mediaForm");
  const mediaMessage = document.getElementById("mediaMessage");
  const mediaList = document.getElementById("mediaList");

  const logoutButton = document.getElementById("logoutButton");

  const setMessage = (element, text, isError) => {
    element.textContent = text;
    element.classList.toggle("error", Boolean(isError));
    element.classList.toggle("success", !isError && text.length > 0);
  };

  const renderMedia = (files) => {
    mediaList.innerHTML = "";

    if (!Array.isArray(files) || files.length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "No uploaded event media yet.";
      mediaList.appendChild(empty);
      return;
    }

    files.forEach((file) => {
      const card = document.createElement("article");
      card.className = "event-media-item";

      if (file.type === "video") {
        const video = document.createElement("video");
        video.controls = true;
        video.preload = "metadata";
        video.src = file.url;
        card.appendChild(video);
      } else {
        const image = document.createElement("img");
        image.src = file.url;
        image.alt = "Event media preview";
        image.loading = "lazy";
        card.appendChild(image);
      }

      const label = document.createElement("p");
      label.className = "admin-file-label";
      label.textContent = file.filename;
      card.appendChild(label);

      mediaList.appendChild(card);
    });
  };

  const loadContent = async () => {
    const response = await fetch("/api/content", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("Failed to load site content");
    }

    const payload = await response.json();
    contentEditor.value = JSON.stringify(payload, null, 2);
  };

  const loadMedia = async () => {
    const response = await fetch("/api/events/media", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("Failed to load event media");
    }

    const payload = await response.json();
    renderMedia(Array.isArray(payload.files) ? payload.files : []);
  };

  const showDashboard = async () => {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    await Promise.all([loadContent(), loadMedia()]);
  };

  const showLogin = () => {
    dashboard.hidden = true;
    loginPanel.hidden = false;
  };

  const checkSession = async () => {
    const response = await fetch("/api/auth/session", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      showLogin();
      return;
    }

    const payload = await response.json();
    if (payload.authenticated) {
      await showDashboard();
      return;
    }

    showLogin();
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "", false);

    const formData = new FormData(loginForm);
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      setMessage(loginMessage, "Invalid username or password.", true);
      return;
    }

    loginForm.reset();
    setMessage(loginMessage, "", false);
    await showDashboard();
  });

  contentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(contentMessage, "", false);

    let parsed;
    try {
      parsed = JSON.parse(contentEditor.value);
    } catch (_error) {
      setMessage(contentMessage, "JSON is invalid. Fix formatting and try again.", true);
      return;
    }

    const response = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });

    if (!response.ok) {
      setMessage(contentMessage, "Save failed. Check auth/session and content format.", true);
      return;
    }

    setMessage(contentMessage, "Content saved successfully. All site pages now use the updated content.", false);
  });

  mediaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(mediaMessage, "", false);

    const data = new FormData(mediaForm);
    const files = data.getAll("files");
    if (files.length === 0 || !files[0] || !files[0].name) {
      setMessage(mediaMessage, "Select at least one file to upload.", true);
      return;
    }

    const response = await fetch("/api/events/media", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "Upload failed" }));
      setMessage(mediaMessage, payload.message || "Upload failed.", true);
      return;
    }

    const payload = await response.json();
    renderMedia(Array.isArray(payload.files) ? payload.files : []);
    mediaForm.reset();
    setMessage(mediaMessage, "Files uploaded successfully.", false);
  });

  logoutButton.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showLogin();
  });

  checkSession().catch(() => {
    showLogin();
  });
})();
