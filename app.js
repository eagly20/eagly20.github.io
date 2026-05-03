const API = "https://script.google.com/macros/s/AKfycbxL48kBadx5lhS0lo54jKsUUJknwAZ4Gv42eRJzjW-gnRrfUiVzo7-n5UQ1-dIG0jhhvw/exec";

/* ---------------- ROUTING ---------------- */

function getSlug() {
  const parts = window.location.pathname.split("/");
  return parts[1] === "file" ? parts[2] : null;
}

let slug = getSlug();

window.onload = () => {
  document.getElementById("uploadPage").classList.toggle("hidden", !!slug);
  document.getElementById("filePage").classList.toggle("hidden", !slug);
};

/* ---------------- UPLOAD ---------------- */

let uploading = false;

function upload() {
  if (uploading) return;

  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing file or password");

  uploading = true;

  const btn = document.getElementById("uploadBtn");
  btn.disabled = true;
  btn.innerText = "Uploading...";

  const reader = new FileReader();

  reader.onload = (e) => {
    const base64 = e.target.result.split(",")[1];

    const form = document.createElement("form");
    form.method = "POST";
    form.action = API;

    const input = document.createElement("input");
    input.name = "payload";
    input.value = JSON.stringify({
      action: "upload",
      base64,
      fileName: file.name,
      mimeType: file.type,
      password: pass
    });

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit(); // NO CORS ISSUE
  };

  reader.readAsDataURL(file);
}

/* ---------------- ACCESS FILE ---------------- */

async function loadFile() {
  const pass = document.getElementById("filePass").value;

  // optional manual override
  const manualCode = document.getElementById("codeInput").value;

  const code = manualCode || slug;

  if (!code || !pass) {
    alert("Missing code or password");
    return;
  }

  const res = await fetch(
    `${API}?action=get&id=${code}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerHTML =
      "❌ Wrong code or password";
    return;
  }

  const url = `https://drive.google.com/uc?export=download&id=${data.fileId}`;

  let html = `
    <div><b>${data.name}</b></div>
    <a href="${url}" target="_blank">⬇ Download</a>
    <br><br>
  `;

  /* ---------------- PREVIEW ---------------- */

  if (data.mime.startsWith("image/")) {
    html += `<img src="${url}">`;
  }

  else if (data.mime.startsWith("video/")) {
    html += `<video controls src="${url}"></video>`;
  }

  else if (data.mime.startsWith("audio/")) {
    html += `<audio controls src="${url}"></audio>`;
  }

  else if (data.mime.includes("text")) {
    html += `<iframe src="${url}" style="width:100%;height:300px;border:none"></iframe>`;
  }

  document.getElementById("output").innerHTML = html;
}
