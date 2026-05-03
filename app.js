const API = "https://script.google.com/macros/s/AKfycbxOqoshDTtdySg5ftuGTACXlyiFgBxFwOGobb-Llt67p1SAV4o-C3SDHx-oRiz1O2hvig/exec";

let uploading = false;

/* ---------------- UI SWITCH ---------------- */

function showUpload() {
  document.getElementById("uploadPage").classList.remove("hidden");
  document.getElementById("filePage").classList.add("hidden");
}

function showAccess() {
  document.getElementById("uploadPage").classList.add("hidden");
  document.getElementById("filePage").classList.remove("hidden");
}

window.onload = showUpload;

/* ---------------- UPLOAD ---------------- */

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

  reader.onload = async (e) => {
    const base64 = e.target.result.split(",")[1];

    try {
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
      btn.disabled = false;
      btn.innerText = "Upload File";

      if (data.success) {
        document.getElementById("result").innerHTML = `
          <div class="file-box">
            <b>File Code:</b> ${data.id}<br><br>

            <button onclick="openAccess('${data.id}')">
              Open File
            </button>
          </div>
        `;
      } else {
        document.getElementById("result").innerHTML =
          "<p style='color:red'>Upload failed</p>";
      }

    } catch (err) {
      uploading = false;
      btn.disabled = false;
      btn.innerText = "Upload File";

      document.getElementById("result").innerHTML =
        "<p style='color:red'>Error uploading</p>";
    }
  };

  reader.readAsDataURL(file);
}

/* ---------------- OPEN ACCESS ---------------- */

function openAccess(code) {
  showAccess();
  document.getElementById("codeInput").value = code;
}

/* ---------------- LOAD FILE ---------------- */

async function loadFile() {
  const pass = document.getElementById("filePass").value;
  const code = document.getElementById("codeInput").value;

  if (!code || !pass) return alert("Enter code + password");

  const res = await fetch(
    `${API}?action=get&id=${code}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerHTML =
      "<p style='color:red'>Wrong code or password</p>";
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
  } else {
    preview = `<p>No preview available</p>`;
  }

  document.getElementById("output").innerHTML = `
    <div class="file-box">

      <h3>${data.name}</h3>

      <a class="download-btn" href="${url}" target="_blank">
        ⬇ Download
      </a>

      ${preview}

    </div>
  `;
}
