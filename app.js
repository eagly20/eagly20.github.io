const API = "https://script.google.com/macros/s/AKfycbwAfrRmymeQaW9YQX9zuhiCaxzrhThBNNOGhSo0_Oj5fdJ1cbt-G-CZ7ybzXbgaTwyMeQ/exec";

// router
function getSlug() {
  const p = window.location.pathname.split("/");
  if (p[1] === "file") return p[2];
  return null;
}

const slug = getSlug();

window.onload = () => {
  document.getElementById("uploadPage").style.display = slug ? "none" : "block";
  document.getElementById("filePage").style.display = slug ? "block" : "none";
};

/* ---------------- UPLOAD (NO FETCH = NO CORS) ---------------- */

function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("upPass").value;

  if (!file || !pass) return alert("Missing fields");

  const reader = new FileReader();

  reader.onload = function(e) {
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
      password: pass
    });

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
  };

  reader.readAsDataURL(file);
}

/* ---------------- DOWNLOAD (SAFE GET REQUEST) ---------------- */

async function loadFile() {
  const pass = document.getElementById("downPass").value;

  const res = await fetch(
    `${API}?action=get&id=${slug}&password=${pass}`
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("output").innerText = "Wrong password";
    return;
  }

  const base = `data:${data.type};base64,${data.data}`;

  let html = `
    <a href="${base}" download="${data.name}">Download</a><br><br>
  `;

  if (data.type.startsWith("image/")) {
    html += `<img src="${base}">`;
  } else if (data.type.startsWith("video/")) {
    html += `<video controls src="${base}"></video>`;
  } else if (data.type.startsWith("audio/")) {
    html += `<audio controls src="${base}"></audio>`;
  }

  document.getElementById("output").innerHTML = html;
}
