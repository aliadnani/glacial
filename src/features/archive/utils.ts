function chunk(input: Uint8Array, sizePerChunk: number): Uint8Array[] {
  if (sizePerChunk <= 0) {
    throw new Error("Chunk size must be a positive integer");
  }

  const result: Uint8Array[] = [];
  const totalChunks = Math.ceil(input.length / sizePerChunk);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * sizePerChunk;
    const end = Math.min(start + sizePerChunk, input.length);
    const chunk = input.subarray(start, end);
    result.push(chunk);
  }

  return result;
}

export { chunk };
