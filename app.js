const API = "https://script.google.com/macros/s/AKfycbxL48kBadx5lhS0lo54jKsUUJknwAZ4Gv42eRJzjW-gnRrfUiVzo7-n5UQ1-dIG0jhhvw/exec";

/* ---------------- ROUTING FIX ---------------- */

function getSlug() {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);

  const i = parts.indexOf("file");
  if (i !== -1 && parts[i + 1]) return parts[i + 1];

  return null;
}

const slug = getSlug();

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

    form.submit();
  };

  reader.readAsDataURL(file);
}

/* ---------------- LOAD FILE ---------------- */

async function loadFile() {
  const pass = document.getElementById("filePass").value;
  const code = document.getElementById("codeInput").value || slug;

  if (!code || !pass) {
    document.getElementById("output").innerHTML =
      "<p style='color:red'>Enter code + password</p>";
    return;
  }

  const res = await fetch(
    `${API}?action=get&id=${code}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerHTML =
      "<p style='color:red'>❌ Wrong code or password</p>";
    return;
  }

  const url = `https://drive.google.com/uc?export=download&id=${data.fileId}`;

  let preview = "";

  if (data.mime.startsWith("image/")) {
    preview = `<img class="preview" src="${url}">`;
  }

  else if (data.mime.startsWith("video/")) {
    preview = `<video class="preview" controls src="${url}"></video>`;
  }

  else if (data.mime.startsWith("audio/")) {
    preview = `<audio class="preview" controls src="${url}"></audio>`;
  }

  else {
    preview = `<p>No preview available</p>`;
  }

  document.getElementById("output").innerHTML = `
    <div class="file-box">

      <h3>${data.name}</h3>

      <a class="download-btn" href="${url}" target="_blank">
        ⬇ Download File
      </a>

      ${preview}

    </div>
  `;
}
