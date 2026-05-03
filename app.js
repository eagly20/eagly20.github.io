const API = "https://script.google.com/macros/s/AKfycbwJ-E4suu9Ay0K9xUdLpYe4Vee8ygpxpv1jz3DHnprsxbZRz2e5E81xzbXm7ClLdKhIxw/exec";

/* ---------------- UPLOAD (SAFE FORM POST) ---------------- */

function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing file or password");

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
    preview = `<img class="preview" src="${url}">`;
  } else if (data.mime.startsWith("video/")) {
    preview = `<video class="preview" controls src="${url}"></video>`;
  } else if (data.mime.startsWith("audio/")) {
    preview = `<audio class="preview" controls src="${url}"></audio>`;
  }

  document.getElementById("output").innerHTML = `
    <div class="box">
      <h3>${data.name}</h3>
      <a href="${url}" target="_blank">Download</a>
      ${preview}
    </div>
  `;
}
