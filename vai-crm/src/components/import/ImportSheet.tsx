import Papa from "papaparse";
import * as XLSX from "xlsx";

type ImportSheetProps = {
  onRecords: (rows: any[]) => void;
};

export function ImportSheet({ onRecords }: ImportSheetProps) {
  const handle = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (res) => onRecords(res.data || []),
      });
    } else if (["xlsx", "xls"].includes(ext || "")) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      onRecords(json as any[]);
    } else {
      alert("Formato não suportado. Use CSV/XLSX.");
    }
  };
  
  return (
    <label className="px-3 py-2 rounded-xl border cursor-pointer hover:bg-slate-50">
      Importar Planilha (CSV/XLSX)
      <input
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
      />
    </label>
  );
}