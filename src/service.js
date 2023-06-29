export default class Service {
  processFile({ query, file, onOccurrenceUpdate, onProgress }) {
    const linesLength = { counter: 0 };

    file
      .stream()
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(this.#csvToJson({ linesLength, onProgress }))
      .pipeTo(
        new WritableStream({
          write(chunk) {
            console.log("chunk", chunk);
          },
        })
      );
  }

  #csvToJson({ linesLength, progressFn }) {
    let columns = [];

    return new TransformStream({
      transform(chunk, controller) {
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
}
