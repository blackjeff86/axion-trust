"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type FormMode = "login" | "register";

type DemoAccessProfile = {
  id: string;
  label: string;
  description: string;
  roleLabel: string;
  userType: "internal" | "external";
  organizationName: string | null;
  capabilities: string[];
  accentClassName: string;
  status: "available" | "missing";
};

type DemoAccessProfilesResponse = {
  enabled: boolean;
  profiles: DemoAccessProfile[];
};

export function LoginForm() {
  const [mode, setMode] = useState<FormMode>("login");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [demoAccessProfiles, setDemoAccessProfiles] = useState<DemoAccessProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadProfiles() {
      try {
        const response = await fetch("/api/auth/dev-access-profiles", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar perfis.");
        }

        const payload = (await response.json()) as DemoAccessProfilesResponse;

        if (!ignore) {
          setDemoAccessProfiles(payload.enabled ? payload.profiles : []);
        }
      } catch {
        if (!ignore) {
          setDemoAccessProfiles([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingProfiles(false);
        }
      }
    }

    loadProfiles();

    return () => {
      ignore = true;
    };
  }, []);

  async function authenticate(credentials: { email: string; password: string } | { profileId: string }) {
    const response = await signIn("credentials", {
      ...credentials,
      redirect: false,
    });

    if (!response || response.error) {
      setError("Email ou senha invalidos.");
      return false;
    }

    window.location.href = "/";
    return true;
  }

  async function handleQuickAccess(profileId: string) {
    setError(null);
    setIsLoading(true);

    try {
      await authenticate({ profileId });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            company,
            email,
            password,
          }),
        });

        const registerPayload = (await registerResponse.json()) as { error?: string };

        if (!registerResponse.ok) {
          setError(registerPayload.error ?? "Nao foi possivel criar o acesso.");
          return;
        }
      }

      const authenticated = await authenticate({ email, password });

      if (!authenticated) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:p-10">
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            AXION Trust
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white">Governanca segura por tenant.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Cada organizacao controla apenas suas politicas, aprovacoes e grants por documento. O acesso externo fica
            rastreado, com expiracao e aceite de NDA quando necessario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: "Tenant isolado",
              description: "Todo dado interno responde ao tenant ativo da sessao.",
            },
            {
              title: "Grants por documento",
              description: "Acesso externo nunca abre o tenant inteiro.",
            },
            {
              title: "Trilha auditavel",
              description: "Requests, aprovacoes e downloads geram historico.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-500/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">Acesso rapido de desenvolvimento</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Escolha um perfil para entrar sem expor as credenciais na interface.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              dev only
            </span>
          </div>

          {isLoadingProfiles ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
              Carregando perfis de acesso...
            </div>
          ) : demoAccessProfiles.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {demoAccessProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  disabled={isLoading || profile.status !== "available"}
                  onClick={() => handleQuickAccess(profile.id)}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left transition-colors hover:border-primary/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-white">{profile.label}</p>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${profile.accentClassName}`}>
                          {profile.roleLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-slate-400">{profile.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                          {profile.userType === "internal" ? "interno" : "externo"}
                        </span>
                        {profile.organizationName ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                            {profile.organizationName}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 truncate text-[11px] text-slate-500">{profile.capabilities.join(" / ")}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                      entrar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
              Perfis rapidos indisponiveis neste ambiente.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:p-10">
        <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/5 p-1">
          {([
            { id: "login", label: "Entrar" },
            { id: "register", label: "Criar acesso externo" },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode(item.id);
                setError(null);
              }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                mode === item.id ? "bg-primary text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" ? "Entrar no workspace" : "Registrar visitante externo"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {mode === "login"
              ? "Use uma conta interna ou guest ja provisionada no tenant."
              : "Esse cadastro cria sua identidade global por email para requests e grants por documento."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Nome</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  placeholder="Seu nome"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Empresa</span>
                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
                  placeholder="Empresa do solicitante"
                  required
                />
              </label>
            </>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              placeholder="nome@empresa.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              placeholder="Sua senha"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-primary/20 transition-transform hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta e entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}
