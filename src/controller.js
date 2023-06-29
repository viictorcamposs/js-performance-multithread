export default class Controller {
  #view;
  #worker;
  #service;
  #events = {
    alive: () => {
      console.log("alive");
    },
    progress: ({ total }) => this.#view.updateProgress(total),
    occurrenceUpdate: ({ found, took, linesLength }) => {
      const [[key, value]] = Object.entries(found);
      const searchValue = key.replace("/", "").replace("/i", "");

      this.#view.updateDebugLog(
        `
          Found ${value} occurrences of "${searchValue}" - over ${linesLength} lines 
          Time: ${took}
        `
      );
    },
  };

  constructor({ view, worker, service }) {
    this.#view = view;
    this.#service = service;
    this.#worker = this.#configureWorker(worker);
  }

  static init(deps) {
    const controller = new Controller(deps);

    controller.init();

    return controller;
  }

  init() {
    this.#view.configureOnFileChange(this.#configureOnFileChange.bind(this));
    this.#view.configureOnFormSubmit(this.#configureOnFormSubmit.bind(this));
  }

  #configureWorker(worker) {
    worker.onmessage = ({ data }) => this.#events[data.eventType](data);

    return worker;
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

  #configureOnFormSubmit({ description, file }) {
    const query = {};
    query["call description"] = new RegExp(description, "i");

    if (this.#view.isWorkerThreadEnabled()) {
      this.#worker.postMessage({ query, file });
      return;
    }
  }
}
