const API = "https://script.google.com/macros/s/AKfycbxOqoshDTtdySg5ftuGTACXlyiFgBxFwOGobb-Llt67p1SAV4o-C3SDHx-oRiz1O2hvig/exec";

/* ---------------- UPLOAD (NO CORS PRE-FLIGHT) ---------------- */

function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing file or password");

  const reader = new FileReader();

  reader.onload = (e) => {
    const base64 = e.target.result.split(",")[1];

    // 🔥 IMPORTANT: use FORM POST instead of fetch JSON
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

    form.submit(); // NO CORS ERROR
  };

  reader.readAsDataURL(file);
}

/* ---------------- LOAD FILE (SAFE GET REQUEST) ---------------- */

async function loadFile() {
  const code = document.getElementById("code").value;
  const pass = document.getElementById("filePass").value;

  const res = await fetch(
    `${API}?action=get&id=${code}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerHTML =
      "<p style='color:red'>Wrong code/password</p>";
    return;
  }

  const url = `https://drive.google.com/uc?export=download&id=${data.fileId}`;

  let preview = "";

  if (data.mime.startsWith("image/")) {
    preview = `<img src="${url}">`;
  } else if (data.mime.startsWith("video/")) {
    preview = `<video controls src="${url}"></video>`;
  } else if (data.mime.startsWith("audio/")) {
    preview = `<audio controls src="${url}"></audio>`;
  }

  document.getElementById("output").innerHTML = `
    <div class="box">
      <h3>${data.name}</h3>
      <a href="${url}" target="_blank">Download</a>
      ${preview}
    </div>
  `;
}
