const API = "https://script.google.com/macros/s/AKfycbxEAFo7WiMjMW22kv4G-aQMFo-PyvUA7Ci9pZ8azZmzbnzXEUvItG52wa5qltYO7lgWPA/exec";

// 🔥 "slug" router
function getSlug() {
  const path = window.location.pathname.split("/");
  if (path[1] === "file") return path[2];
  return null;
}

// show page based on route
const slug = getSlug();

if (slug) {
  document.getElementById("uploadPage").style.display = "none";
  document.getElementById("filePage").style.display = "block";
} else {
  document.getElementById("uploadPage").style.display = "block";
  document.getElementById("filePage").style.display = "none";
}

/* ---------------- UPLOAD ---------------- */

async function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("upPass").value;

  if (!file || !pass) return alert("Missing fields");

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

    if (data.success) {
      const link = window.location.origin + "/file/" + data.id;

      document.getElementById("upResult").innerHTML =
        `Slug: <b>${data.id}</b><br>
         Link: <a href="${link}">${link}</a>`;
    }
  };

  reader.readAsDataURL(file);
}

/* ---------------- DOWNLOAD ---------------- */

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
    document.getElementById("output").innerText = "Wrong password";
    return;
  }

  const base = `data:${data.type};base64,${data.data}`;

  let html = `<a href="${base}" download="${data.name}">Download</a><br><br>`;

  if (data.type.startsWith("image/")) {
    html += `<img src="${base}">`;
  } else if (data.type.startsWith("video/")) {
    html += `<video controls src="${base}"></video>`;
  } else if (data.type.startsWith("audio/")) {
    html += `<audio controls src="${base}"></audio>`;
  } else {
    html += `<p>No preview</p>`;
  }

  document.getElementById("output").innerHTML = html;
}
