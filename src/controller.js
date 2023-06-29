export default class Controller {
  #view;
  #worker;
  #service;

  constructor({ view, worker, service }) {
    this.#view = view;
    this.#service = service;
    this.#worker = worker;
  }

  static init(deps) {
    const controller = new Controller(deps);

    controller.init();

    return controller;
  }

  init() {
    this.#view.configureOnFileChange(this.#configureOnFileChange.bind(this));
  }

  #formatFileSize(size) {
    const units = ["B", "KB", "MB", "GB", "TB"];

    let i = 0;

    for (i; size >= 1024 && i < 4; i++) {
      size /= 1024;
    }

    return `${size.toFixed(2)} ${units[i]}`;
  }

  #configureOnFileChange(file) {
    const fileSize = this.#formatFileSize(file.size);

    this.#view.setFileSize(fileSize);
  }
}
