function downloadBinary(fileName: string, buffer: Uint8Array) {
  const url = window.URL.createObjectURL(
    new Blob([buffer], {
      type: "application/octet-stream",
    }),
  );

  const a = document.createElement("a");
  document.body.appendChild(a);
  a.href = url;
  a.download = `glacial-recovered-${fileName}`;
  a.click();
  window.URL.revokeObjectURL(url);

  document.body.removeChild(a);
}

export { downloadBinary };
