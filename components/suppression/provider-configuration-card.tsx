"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TcpaProviderConfig } from "@/lib/mock/suppression";

interface Props {
  config: TcpaProviderConfig;
  onChange: (patch: Partial<TcpaProviderConfig>) => void;
}

/** Provider Configuration card on the TCPA Shield detail page. */
export function ProviderConfigurationCard({ config, onChange }: Props) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);

  const onTest = async () => {
    if (!config.apiLogin.trim() || !config.apiPassword.trim()) {
      toast.error("API Login and Password are required to test the connection.");
      return;
    }
    setTesting(true);
    setResponse(null);
    // Mocked round-trip — pretend we hit the provider and got back a payload.
    await new Promise((r) => setTimeout(r, Math.min(config.timeoutMs, 1500)));
    const payload = {
      status: "ok",
      provider: "TCPA / DNC",
      latencyMs: Math.round(80 + Math.random() * 220),
      sample: {
        number: "+14155550100",
        litigator: false,
        dnc: false,
        confidence: 0.97,
      },
    };
    setResponse(JSON.stringify(payload, null, 2));
    setTesting(false);
    toast.success("Test connection successful");
  };

  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          Provider configuration
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure API credentials and settings for this DNC provider.
        </p>
      </div>

      <div className="my-4 h-px w-full bg-border" />

      {/* API Login */}
      <div className="grid grid-cols-1 items-center gap-3 py-2 sm:grid-cols-[1fr_minmax(0,1fr)]">
        <div>
          <Label htmlFor="prov-login" className="text-sm">
            API Login <span className="text-destructive">*</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">Your API access login</p>
        </div>
        <Input
          id="prov-login"
          value={config.apiLogin}
          onChange={(e) => onChange({ apiLogin: e.target.value })}
          placeholder="Type your Login"
        />
      </div>

      <div className="my-2 h-px w-full bg-border" />

      {/* API Password */}
      <div className="grid grid-cols-1 items-center gap-3 py-2 sm:grid-cols-[1fr_minmax(0,1fr)]">
        <div>
          <Label htmlFor="prov-pass" className="text-sm">
            API Password <span className="text-destructive">*</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">Your API access password</p>
        </div>
        <div className="relative">
          <Input
            id="prov-pass"
            type={showPassword ? "text" : "password"}
            value={config.apiPassword}
            onChange={(e) => onChange({ apiPassword: e.target.value })}
            placeholder="Type your Password"
            className="pr-8"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="my-2 h-px w-full bg-border" />

      {/* Timeout */}
      <div className="grid grid-cols-1 items-center gap-3 py-2 sm:grid-cols-[1fr_minmax(0,1fr)]">
        <div>
          <Label htmlFor="prov-timeout" className="text-sm">
            Timeout
          </Label>
          <p className="text-[11px] text-muted-foreground">Max wait time for API response</p>
        </div>
        <div className="relative">
          <Input
            id="prov-timeout"
            type="number"
            min={100}
            step={100}
            value={config.timeoutMs}
            onChange={(e) =>
              onChange({ timeoutMs: Number.isFinite(+e.target.value) ? +e.target.value : 1500 })
            }
            className="pr-10 tabular-nums"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider text-muted-foreground">
            ms
          </span>
        </div>
      </div>

      <div className="my-2 h-px w-full bg-border" />

      {/* Response */}
      <div className="grid grid-cols-1 items-start gap-3 py-2 sm:grid-cols-[1fr_minmax(0,1fr)]">
        <div>
          <Label className="text-sm">Response</Label>
          <p className="text-[11px] text-muted-foreground">
            Verify the response to ensure correct configuration. Only <span className="font-semibold text-foreground">JSON</span> and{" "}
            <span className="font-semibold text-foreground">XML</span> response formats are supported for preview.
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onTest} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>
      </div>

      <pre
        className={
          "mt-2 h-40 w-full overflow-auto rounded-md border border-border bg-secondary/30 p-3 font-mono text-[11px] text-foreground/90 " +
          (response ? "" : "flex items-center justify-center text-center text-muted-foreground")
        }
      >
        {response ?? "Response from the API test will appear here"}
      </pre>
    </Card>
  );
}
