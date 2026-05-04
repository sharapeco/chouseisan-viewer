/**
 * Parse a CSV string into a 2-D array of strings.
 * Handles RFC 4180 quoting: quoted fields may contain commas, newlines,
 * and doubled double-quotes as an escape sequence.
 */
export function parseRows(raw: string): string[][] {
  const src = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let i = 0;

  while (i < src.length) {
    const row: string[] = [];

    // Parse one row (stops at unquoted \n or end of input)
    while (true) {
      let cell = "";

      if (src[i] === '"') {
        // Quoted field — may span multiple lines
        i++;
        while (i < src.length) {
          if (src[i] === '"') {
            if (src[i + 1] === '"') {
              cell += '"';
              i += 2;
            } else {
              i++; // closing quote
              break;
            }
          } else {
            cell += src[i++];
          }
        }
      } else {
        while (i < src.length && src[i] !== "," && src[i] !== "\n") {
          cell += src[i++];
        }
      }

      row.push(cell);

      if (i >= src.length || src[i] === "\n") {
        if (i < src.length) i++; // skip \n
        break;
      }
      i++; // skip ,
    }

    rows.push(row);
  }

  // Drop the phantom empty row produced by a trailing newline
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 1 && last[0] === "") rows.pop();
  }

  return rows;
}
