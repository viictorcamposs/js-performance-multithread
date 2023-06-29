export default class View {
  #file = document.querySelector("#csv-file");
  #fileSize = document.querySelector("#file-size");

  setFileSize(size) {
    this.#fileSize.innerText = `File size: ${size}\n`;
  }

  configureOnFileChange(fn) {
    this.#file.addEventListener("change", (event) => {
      fn(event.target.files[0]);
    });
  }
}
