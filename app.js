const API = "https://script.google.com/macros/s/AKfycbxL48kBadx5lhS0lo54jKsUUJknwAZ4Gv42eRJzjW-gnRrfUiVzo7-n5UQ1-dIG0jhhvw/exec";

let uploading = false;

/* ---------------- ROUTING ---------------- */

function getSlug() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const i = parts.indexOf("file");
  return (i !== -1 && parts[i + 1]) ? parts[i + 1] : null;
}

const slug = getSlug();

window.onload = () => {
  document.getElementById("uploadPage").classList.toggle("hidden", !!slug);
  document.getElementById("filePage").classList.toggle("hidden", !slug);
};

/* ---------------- UPLOAD (FIXED + SHOW CODE) ---------------- */

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
        headers: {
          "Content-Type": "application/json"
        },
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
        const link = `${window.location.origin}/file/${data.id}`;

        document.getElementById("result").innerHTML = `
          <div class="file-box">
            <b>File Code:</b> ${data.id}<br><br>
            <a class="download-btn" href="${link}">
              Open File Page
            </a>
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

/* ---------------- LOAD FILE ---------------- */

async function loadFile() {
  const pass = document.getElementById("filePass").value;
  const code = document.getElementById("codeInput").value || slug;

  if (!code || !pass) {
    return alert("Enter code + password");
  }

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
