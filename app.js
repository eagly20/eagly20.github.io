const API = "https://script.google.com/macros/s/AKfycbz3YMLYzA1_vNDP5zETy5_zKzi__5qA62JgoPK0_Uw5wfewDo56JymalsmZiT_g20uSpw/exec";

function getSlug() {
  const p = window.location.pathname.split("/");
  return p[1] === "file" ? p[2] : null;
}

const slug = getSlug();

window.onload = () => {
  document.getElementById("uploadPage").classList.toggle("hidden", !!slug);
  document.getElementById("filePage").classList.toggle("hidden", !slug);
};

/* ---------------- UPLOAD (NO CORS) ---------------- */

function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("pass").value;

  if (!file || !pass) return alert("Missing fields");

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

    form.submit(); // 🔥 NO CORS HERE
  };

  reader.readAsDataURL(file);
}

/* ---------------- LOAD FILE ---------------- */

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
    <a href="${data.url}" target="_blank">Download</a><br><br>
  `;

  if (data.mime.startsWith("image/")) {
    html += `<img src="${data.url}">`;
  } else if (data.mime.startsWith("video/")) {
    html += `<video controls src="${data.url}"></video>`;
  }

  document.getElementById("output").innerHTML = html;
}
