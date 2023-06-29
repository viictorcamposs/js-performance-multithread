//! worker with ESModules is experimental on Chrome and only on Chrome
postMessage({ eventType: "alive" });

onmessage = ({ data }) => {
  postMessage({ eventType: "progress" });
  postMessage({ eventType: "occurrenceUpdate" });
};
