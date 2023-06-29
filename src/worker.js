//! worker with ESModules is experimental on Chrome and only on Chrome
import Service from "./service.js";

const service = new Service();

postMessage({ eventType: "alive" });

onmessage = ({ data }) => {
  const { query, file } = data;

  service.processFile({
    file,
    query,
    onOccurrenceUpdate: (args) => {
      postMessage({ eventType: "occurrenceUpdate", ...args });
    },
    onProgress: (total) => {
      postMessage({ eventType: "progress", total });
    },
  });
};
