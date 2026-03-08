import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CsvImportExportProps {
  module: string;
  fields: { key: string; label: string; required?: boolean }[];
  data: any[];
  onImport: (records: Record<string, string>[]) => Promise<void>;
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const vals: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { vals.push(current.trim()); current = ""; continue; }
      current += char;
    }
    vals.push(current.trim());
    return vals;
  });
  return { headers, rows };
}

function exportToCsv(data: any[], fields: { key: string; label: string }[], filename: string) {
  const headerRow = fields.map((f) => `"${f.label}"`).join(",");
  const dataRows = data.map((row) =>
    fields.map((f) => {
      const val = row[f.key];
      if (val == null) return "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [headerRow, ...dataRows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImportExport({ module, fields, data, onImport }: CsvImportExportProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers, rows } = parseCsv(ev.target?.result as string);
      setCsvHeaders(headers);
      setCsvRows(rows);
      // Auto-map by similarity
      const autoMap: Record<string, string> = {};
      fields.forEach((f) => {
        const match = headers.find(
          (h) => h.toLowerCase().replace(/[_\s]/g, "") === f.key.toLowerCase().replace(/[_\s]/g, "") ||
            h.toLowerCase().replace(/[_\s]/g, "") === f.label.toLowerCase().replace(/[_\s]/g, "")
        );
        if (match) autoMap[f.key] = match;
      });
      setMapping(autoMap);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const requiredFields = fields.filter((f) => f.required);
    const missingRequired = requiredFields.filter((f) => !mapping[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Map required fields: ${missingRequired.map((f) => f.label).join(", ")}`);
      return;
    }

    setImporting(true);
    try {
      const records = csvRows.map((row) => {
        const record: Record<string, string> = {};
        fields.forEach((f) => {
          const csvHeader = mapping[f.key];
          if (csvHeader) {
            const idx = csvHeaders.indexOf(csvHeader);
            if (idx >= 0) record[f.key] = row[idx] || "";
          }
        });
        return record;
      }).filter((r) => Object.values(r).some((v) => v));

      await onImport(records);
      toast.success(`Imported ${records.length} ${module} records`);
      setImportOpen(false);
      setCsvHeaders([]);
      setCsvRows([]);
      setMapping({});
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportToCsv(data, fields, module)}>
        <Download className="w-3.5 h-3.5" /> Export
      </Button>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Import {module}
            </DialogTitle>
          </DialogHeader>

          {csvHeaders.length === 0 ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}>
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Click to upload CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files with headers</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <a
                href={`/samples/sample-${module}.csv`}
                download
                className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download sample CSV template
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm text-foreground">{csvRows.length} rows found with {csvHeaders.length} columns</span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                <p className="text-sm font-medium text-foreground">Map CSV columns to fields:</p>
                {fields.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <Label className="w-32 text-sm flex-shrink-0">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Select value={mapping[field.key] || "skip"} onValueChange={(v) => setMapping((m) => ({ ...m, [field.key]: v === "skip" ? "" : v }))}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Skip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">-- Skip --</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleImport} disabled={importing}>
                  {importing ? "Importing..." : `Import ${csvRows.length} Records`}
                </Button>
                <Button variant="outline" onClick={() => { setCsvHeaders([]); setCsvRows([]); setMapping({}); }}>Reset</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
