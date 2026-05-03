const API = "https://script.google.com/macros/s/AKfycbyxeqag1v5P7O_pJGUXfw2yUq1igCChNmj4oDhwAGlut_l8BGzGDI48yAKchXD96R2VwA/exec";

// Get code from URL
const pathParts = window.location.pathname.split("/");
const code = pathParts[2];

// Upload
async function upload() {
  const file = document.getElementById("file").files[0];
  const pass = document.getElementById("uploadPass").value;

  const reader = new FileReader();

  reader.onload = async function(e) {
    const base64 = e.target.result.split(",")[1];

    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "upload",
        base64: base64,
        fileName: file.name,
        password: pass
      })
    });

    const data = await res.json();

    if (data.success) {
      const link = window.location.origin + "/file/" + data.code;

      document.getElementById("uploadResult").innerHTML =
        "Code: " + data.code + "<br>" +
        "<a href='" + link + "'>" + link + "</a>";
    }
  };

  reader.readAsDataURL(file);
}

// Load file
async function loadFile() {
  const pass = document.getElementById("downloadPass").value;

  const res = await fetch(
    API + "?action=get&code=" + code + "&password=" + pass
  );

  const data = await res.json();

  if (!data.success) {
    document.getElementById("fileArea").innerText = "Wrong password";
    return;
  }

  const base = "data:" + data.type + ";base64," + data.data;

  let html = `<a href="${base}" download="${data.name}">Download</a><br>`;

  if (data.type.startsWith("image/")) {
    html += `<img src="${base}">`;
  } else if (data.type.startsWith("video/")) {
    html += `<video controls src="${base}"></video>`;
  }

  document.getElementById("fileArea").innerHTML = html;
}
