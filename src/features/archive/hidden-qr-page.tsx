import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { chunk } from "./utils";
import { encode } from "@/features/z85";

interface HiddenQrPageProps {
  file?: File;
  bytesPerQrCode: number;
}

function HiddenQrPage(props: HiddenQrPageProps) {
  const { file } = props;
  const [z85Strings, setZ85Strings] = useState<string[]>();

  useEffect(() => {
    async function awaitArrayBuffer() {
      const awaitedArrayBuffer = await (file as File).arrayBuffer();
      const int8Array = new Uint8Array(awaitedArrayBuffer);

      const chunkedInt8Arrays = chunk(int8Array, 612);
      const z85edArrayBuffers = chunkedInt8Arrays

        .map((buf) => encode(buf))
        .map(
          (zStr, idx) =>
            `${zStr}~fileName=${file?.name}~pages=${idx + 1}/${chunkedInt8Arrays.length}`,
        );
      setZ85Strings(z85edArrayBuffers);
    }
    if (file) {
      awaitArrayBuffer();
    }
  }, [file, z85Strings]);

  return <>{z85Strings && <StringTables strings={z85Strings} />}</>;
}

interface Props {
  strings: string[];
}

const StringTables: React.FC<Props> = ({ strings }) => {
  // Number of elements per table (2 columns x 3 rows)
  const elementsPerTable = 6;

  // Calculate the number of tables needed
  const numTables = Math.ceil(strings.length / elementsPerTable);

  return (
    <div>
      {Array.from({ length: numTables }, (_, tableIndex) => {
        // Get the start index for slicing the strings array
        const startIndex = tableIndex * elementsPerTable;
        const currentTableStrings = strings.slice(
          startIndex,
          startIndex + elementsPerTable,
        );

        return (
          <>
            <div className="page-break" />
            <p className="text-sm">
              glacial | scan top to bottom, left to right | page{" "}
              {tableIndex + 1}/{numTables}
            </p>
            <table key={tableIndex}>
              <tbody>
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {/* Map over each column in the current row */}
                    {Array.from({ length: 2 }, (_, colIndex) => {
                      // Calculate the index within currentTableStrings
                      const stringIndex = rowIndex * 2 + colIndex;
                      return (
                        <td key={colIndex}>
                          {stringIndex < currentTableStrings.length ? (
                            <QRCodeSVG
                              size={322}
                              value={currentTableStrings[stringIndex]}
                              marginSize={2}
                            />
                          ) : (
                            ""
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      })}
    </div>
  );
};

export { HiddenQrPage, HiddenQrPageProps };
