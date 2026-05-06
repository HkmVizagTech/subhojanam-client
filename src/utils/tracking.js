function getCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

function getMetaBrowserIds() {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  const fbc = getCookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : "");

  return {
    fbp: getCookie("_fbp"),
    fbc,
  };
}

export { getMetaBrowserIds };
