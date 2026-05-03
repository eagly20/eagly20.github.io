const API = "https://script.google.com/macros/s/AKfycbxOqoshDTtdySg5ftuGTACXlyiFgBxFwOGobb-Llt67p1SAV4o-C3SDHx-oRiz1O2hvig/exec";

let uploading = false;

/* ---------------- SIMPLE SWITCH ---------------- */

function showUpload() {
  document.getElementById("uploadView").classList.remove("hidden");
  document.getElementById("accessView").classList.add("hidden");
}

function showAccess() {
  document.getElementById("uploadView").classList.add("hidden");
  document.getElementById("accessView").classList.remove("hidden");
}

window.onload = showUpload;

/* ---------------- UPLOAD ---------------- */

function upload() {
  if (uploading) return;

  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing file or password");

  uploading = true;

  const reader = new FileReader();

  reader.onload = async (e) => {
    const base64 = e.target.result.split(",")[1];

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upload",
        base64,
        fileName: file.name,
        mimeType: file.type,
        password: pass
      })
    });

    const data = await res.json();

    uploading = false;

    if (data.success) {
      document.getElementById("result").innerHTML = `
        <div class="box">
          <b>Code:</b> ${data.id}<br><br>
          <button onclick="openAccess('${data.id}')">Open File</button>
        </div>
      `;
    } else {
      document.getElementById("result").innerHTML = "Upload failed";
    }
  };

  reader.readAsDataURL(file);
}

/* ---------------- OPEN ACCESS ---------------- */

function openAccess(code) {
  showAccess();
  document.getElementById("code").value = code;
}

/* ---------------- LOAD FILE ---------------- */

async function loadFile() {
  const code = document.getElementById("code").value;
  const pass = document.getElementById("filePass").value;

  const res = await fetch(`${API}?action=get&id=${code}&password=${pass}`);
  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerHTML =
      "<p style='color:red'>Wrong code/password</p>";
    return;
  }

  const url = `https://drive.google.com/uc?export=download&id=${data.fileId}`;

  let preview = "";

  if (data.mime.startsWith("image/")) {
    preview = `<img class="preview" src="${url}">`;
  } else if (data.mime.startsWith("video/")) {
    preview = `<video class="preview" controls src="${url}"></video>`;
  } else if (data.mime.startsWith("audio/")) {
    preview = `<audio class="preview" controls src="${url}"></audio>`;
  }

  document.getElementById("output").innerHTML = `
    <div class="box">
      <h3>${data.name}</h3>
      <a class="download" href="${url}" target="_blank">Download</a>
      ${preview}
    </div>
  `;
}
