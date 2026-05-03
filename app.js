(() => {
  // ensures browser environment only

  const API = "https://script.google.com/macros/s/AKfycby24FePvzhljSHiLjSQ1E96dWENE50MWVYpxQ7JPE2p9eCxquozUXcR1vHKO4xhKtASUg/exec";

  if (typeof window === "undefined") {
    return; // prevents server-side execution errors
  }

  function getSlug() {
    const path = window.location.pathname.split("/");
    if (path[1] === "file") return path[2];
    return null;
  }

  const slug = getSlug();

  window.onload = () => {
    const uploadPage = document.getElementById("uploadPage");
    const filePage = document.getElementById("filePage");

    if (!uploadPage || !filePage) return;

    uploadPage.style.display = slug ? "none" : "block";
    filePage.style.display = slug ? "block" : "none";
  };

  let uploading = false;

  window.upload = async function () {
    if (uploading) return;

    const file = document.getElementById("file").files[0];
    const pass = document.getElementById("upPass").value;

    if (!file || !pass) return alert("Missing fields");

    uploading = true;

    const btn = document.querySelector("#uploadPage button");
    btn.disabled = true;
    btn.innerText = "Uploading...";

    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];

      const res = await fetch(API, {
        method: "POST",
        body: JSON.stringify({
          action: "upload",
          base64,
          fileName: file.name,
          password: pass
        })
      });

      const data = await res.json();

      uploading = false;
      btn.disabled = false;
      btn.innerText = "Upload";

      if (data.success) {
        const link = window.location.origin + "/file/" + data.id;

        document.getElementById("upResult").innerHTML = `
          <b>Slug:</b> ${data.id}<br>
          <a href="${link}">${link}</a>
        `;
      }
    };

    reader.readAsDataURL(file);
  };

  window.loadFile = async function () {
    const pass = document.getElementById("downPass").value;

    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "get",
        id: slug,
        password: pass
      })
    });

    const data = await res.json();

    if (!data.success) {
      document.getElementById("output").innerText = "Wrong password";
      return;
    }

    const base = `data:${data.type};base64,${data.data}`;

    let html = `<a href="${base}" download="${data.name}">Download</a><br><br>`;

    if (data.type.startsWith("image/")) {
      html += `<img src="${base}">`;
    } else if (data.type.startsWith("video/")) {
      html += `<video controls src="${base}"></video>`;
    } else if (data.type.startsWith("audio/")) {
      html += `<audio controls src="${base}"></audio>`;
    }

    document.getElementById("output").innerHTML = html;
  };

})();
