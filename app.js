const API = "https://script.google.com/macros/s/AKfycby24FePvzhljSHiLjSQ1E96dWENE50MWVYpxQ7JPE2p9eCxquozUXcR1vHKO4xhKtASUg/exec";

/* ---------------- ROUTER ---------------- */

function getSlug() {
  const parts = window.location.pathname.split("/");
  if (parts[1] === "file") return parts[2];
  return null;
}

const slug = getSlug();

/* page switching */
window.onload = () => {
  if (slug) {
    document.getElementById("uploadPage").classList.add("hidden");
    document.getElementById("filePage").classList.remove("hidden");
  } else {
    document.getElementById("uploadPage").classList.remove("hidden");
    document.getElementById("filePage").classList.add("hidden");
  }
};

/* ---------------- UPLOAD ---------------- */

let uploading = false;

async function upload() {
  if (uploading) return;

  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("upPass").value;
  const btn = document.getElementById("uploadBtn");

  if (!file || !pass) return alert("Select file + password");

  uploading = true;
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
    btn.innerText = "Upload File";

    if (data.success) {
      const link = window.location.origin + "/file/" + data.id;

      document.getElementById("upResult").innerHTML = `
        <b>File Code:</b> ${data.id}<br>
        <a href="${link}" style="color:#00f2fe">${link}</a>
      `;
    }
  };

  reader.readAsDataURL(file);
}

/* ---------------- DOWNLOAD + PREVIEW ---------------- */

async function loadFile() {
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
    document.getElementById("output").innerHTML = "❌ Wrong password";
    return;
  }

  const base = `data:${data.type};base64,${data.data}`;

  let html = `
    <a href="${base}" download="${data.name}" style="color:#00f2fe">
      ⬇ Download File
    </a><br><br>
  `;

  if (data.type.startsWith("image/")) {
    html += `<img src="${base}">`;
  } 
  else if (data.type.startsWith("video/")) {
    html += `<video controls src="${base}"></video>`;
  } 
  else if (data.type.startsWith("audio/")) {
    html += `<audio controls src="${base}"></audio>`;
  } 
  else {
    html += `<p>No preview available</p>`;
  }

  document.getElementById("output").innerHTML = html;
}
