import React from "react";
import { User, Settings, Role, ROLES } from "../../types";
import { Label } from "../common/Label";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

type HeaderProps = {
  settings: Settings;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onExport: () => void;
  onImport: React.ReactNode;
  onConfig: () => void;
};

export function Header({
  settings,
  user,
  setUser,
  onExport,
  onImport,
  onConfig,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ background: settings.brand.primary }}
          />
          <div>
            <h1
              className="text-lg font-bold"
              style={{ color: settings.brand.accent }}
            >
              {settings.brand.title}
            </h1>
            <p className="text-xs text-slate-500">{settings.brand.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Label>Usuário</Label>
            <Input
              value={user.name}
              onChange={(e: any) => setUser({ ...user, name: e.target.value })}
              className="w-40"
            />
            <Select
              value={user.role}
              onChange={(e: any) => setUser({ ...user, role: e.target.value as Role })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={onExport}>Exportar CSV</Button>
          {onImport}
          <Button onClick={onConfig}>Config</Button>
        </div>
      </div>
      <div className="h-1 w-full bg-slate-200">
        <div
          className="h-1"
          style={{ width: "100%", background: settings.brand.primary }}
        />
      </div>
    </header>
  );
}
