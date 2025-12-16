import React from "react";
import { User, Settings } from "../../types";
import { Button } from "../common/Button";
import { Icons } from "../common/Icons";

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
  onConfig,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Icons.Home className="text-orange-500" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">{settings.brand.title}</h1>
            <p className="text-xs text-slate-500">{settings.brand.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="font-medium text-slate-700">{user.name}</div>
            <div className="text-xs text-orange-600 font-medium">{user.role}</div>
          </div>
          
          <Button 
            onClick={onConfig}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
          >
            <Icons.Settings size={16} />
          </Button>
        </div>

      </div>
    </header>
  );
}