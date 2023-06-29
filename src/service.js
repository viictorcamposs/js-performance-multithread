export default class Service {
  processFile({ query, file, onOccurrenceUpdate, onProgress }) {
    const linesLength = { counter: 0 };
    const progressFn = this.#setupProgress(file.size, onProgress);
    const startedAt = performance.now();
    const elapsed = () => (performance.now() - startedAt) / 1000;
    const timeOutput = () => `${elapsed().toFixed()} seconds`;

    const onUpdate = () => {
      return (found) => {
        onOccurrenceUpdate({
          found,
          took: timeOutput(),
          linesLength: linesLength.counter,
        });
      };
    };

    file
      .stream()
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(this.#csvToJson({ linesLength, progressFn }))
      .pipeTo(this.#findOccurrences({ query, onOccurrenceUpdate: onUpdate() }));
  }

  #csvToJson({ linesLength, progressFn }) {
    let columns = [];

    return new TransformStream({
      transform(chunk, controller) {
        progressFn(chunk.length);

        const lines = chunk.split("\n");
        linesLength.counter += lines.length;

        if (!columns.length) {
          const firstLine = lines.shift();
          columns = firstLine.split(",");
          linesLength.counter--;
        }

        for (const line of lines) {
          if (!line.length) continue;

          let currentItem = {};
          const currentColumnsItems = line.split(",");

          for (const columnIndex in currentColumnsItems) {
            const columnItem = currentColumnsItems[columnIndex];

            currentItem[columns[columnIndex]] = columnItem.trimEnd();
          }

          controller.enqueue(currentItem);
        }
      },
    });
  }

  #setupProgress(totalBytes, onProgress) {
    let totalUploaded = 0;
    onProgress(totalUploaded);

    return (chunkLength) => {
      totalUploaded += chunkLength;

      const total = (100 / totalBytes) * totalUploaded;
      onProgress(total);
    };
  }

  #findOccurrences({ query, onOccurrenceUpdate }) {
    const queryKeys = Object.keys(query);
    let found = {};

    return new WritableStream({
      write(jsonLine) {
        for (const keyIndex in queryKeys) {
          const key = queryKeys[keyIndex];
          const queryValue = query[key];

          found[queryValue] = found[queryValue] ?? 0;

          if (queryValue.test(jsonLine[key])) {
            found[queryValue]++;
            onOccurrenceUpdate(found);
          }
        }
      },
      close: () => onOccurrenceUpdate(found),
    });
  }
}
