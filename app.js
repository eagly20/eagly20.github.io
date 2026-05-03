const API = "https://script.google.com/macros/s/AKfycbxQivcTVr_rGz7On-bXCPbn6co96KtaXxLVg3k2d3xCxXJqf8TKxX4orLhbIM27DQGnOA/exec";

/* ---------------- ROUTE ---------------- */

function getSlug() {
  const p = window.location.pathname.split("/");
  if (p[1] === "file") return p[2];
  return null;
}

const slug = getSlug();

window.onload = () => {
  document.getElementById("uploadPage").classList.toggle("hidden", !!slug);
  document.getElementById("filePage").classList.toggle("hidden", !slug);
};

/* ---------------- UPLOAD ---------------- */

async function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing fields");

  const btn = document.querySelector("button");
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
        mimeType: file.type,
        password: pass
      })
    });

    const data = await res.json();

    btn.disabled = false;
    btn.innerText = "Upload";

    if (data.success) {
      const link = window.location.origin + "/file/" + data.id;

      document.getElementById("result").innerHTML = `
        <b>Code:</b> ${data.id}<br>
        <a href="${link}">${link}</a>
      `;
    }
  };

  reader.readAsDataURL(file);
}

/* ---------------- LOAD ---------------- */

async function loadFile() {
  const pass = document.getElementById("filePass").value;

  const res = await fetch(
    `${API}?action=get&id=${slug}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerText = "Wrong password";
    return;
  }

  let html = `
    <a href="${data.url}" target="_blank">⬇ Download File</a><br><br>
  `;

  if (data.mime.startsWith("image/")) {
    html += `<img src="${data.url}">`;
  } else if (data.mime.startsWith("video/")) {
    html += `<video controls src="${data.url}"></video>`;
  } else if (data.mime.startsWith("audio/")) {
    html += `<audio controls src="${data.url}"></audio>`;
  }

  document.getElementById("output").innerHTML = html;
}
