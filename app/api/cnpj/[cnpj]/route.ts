import { NextResponse } from "next/server";

type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  descricao_identificador_matriz_filial?: string;
  descricao_situacao_cadastral?: string;
  cnae_fiscal_descricao?: string;
  natureza_juridica?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  email?: string;
  ddd_telefone_1?: string;
  porte?: string;
  capital_social?: number | string;
  data_inicio_atividade?: string;
};

type MappedSupplierSeed = {
  legalName: string;
  displayName: string;
  domain: string;
  website: string;
  supplierType: string;
  segment: string;
  subsegment: string;
  headquartersCity: string;
  headquartersCountry: string;
  taxId: string;
  primaryContactEmail: string;
  criticality: string;
  integrationType: string;
  dataClassification: string;
  accessScope: string;
  hostingModel: string;
  activeRegions: string;
  servicesProvided: string;
  countriesOfOperation: string;
  risk: "Baixo Risco" | "Médio Risco" | "Alto Risco" | "Risco Crítico";
  source: "brasilapi" | "fallback";
};

const localFallbackByCnpj: Record<string, MappedSupplierSeed> = {
  "12334991000120": {
    legalName: "Prime Logistics International Ltd.",
    displayName: "Prime Logistics Int.",
    domain: "primelog.io",
    website: "https://primelog.io",
    supplierType: "SaaS / Plataforma",
    segment: "Logistica",
    subsegment: "Roteirizacao e fulfillment",
    headquartersCity: "Sao Paulo",
    headquartersCountry: "Brasil",
    taxId: "12.334.991/0001-20",
    primaryContactEmail: "contato@primelog.io",
    criticality: "Media",
    integrationType: "API",
    dataClassification: "Dados corporativos e PII",
    accessScope: "Acesso operacional restrito",
    hostingModel: "SaaS multi-tenant",
    activeRegions: "Brasil e Mexico",
    servicesProvided: "Operacao de fulfillment, despacho e atualizacao de tracking.",
    countriesOfOperation: "Brasil, Mexico",
    risk: "Médio Risco",
    source: "fallback",
  },
};

function normalizeCnpj(value: string) {
  return value.replace(/\D/g, "");
}

function inferSegment(description?: string) {
  if (!description) {
    return "Fornecedor sem segmentacao";
  }

  const normalized = description.toLowerCase();

  if (normalized.includes("software") || normalized.includes("programa")) {
    return "Tecnologia";
  }

  if (normalized.includes("log")) {
    return "Logistica";
  }

  if (normalized.includes("pagamento") || normalized.includes("finance")) {
    return "Financeiro";
  }

  if (normalized.includes("dados") || normalized.includes("processamento")) {
    return "Dados e processamento";
  }

  return description;
}

function inferSupplierType(description?: string) {
  if (!description) {
    return "SaaS / Plataforma";
  }

  const normalized = description.toLowerCase();

  if (normalized.includes("hospedagem") || normalized.includes("nuvem")) {
    return "Infraestrutura Cloud";
  }

  if (normalized.includes("consultoria") || normalized.includes("auditoria")) {
    return "Consultoria / Auditoria";
  }

  if (normalized.includes("pagamento")) {
    return "Pagamentos / Fintech";
  }

  return "SaaS / Plataforma";
}

function inferWebsite(displayName: string, email?: string) {
  if (email?.includes("@")) {
    const emailDomain = email.split("@")[1]?.trim().toLowerCase();

    if (emailDomain) {
      return {
        domain: emailDomain,
        website: `https://${emailDomain}`,
      };
    }
  }

  const slug = displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    domain: "",
    website: slug ? `https://${slug}.com` : "",
  };
}

function mapBrasilApiToSupplierSeed(payload: BrasilApiCnpjResponse): MappedSupplierSeed {
  const legalName = payload.razao_social?.trim() || "Empresa consultada";
  const displayName = payload.nome_fantasia?.trim() || legalName;
  const websiteData = inferWebsite(displayName, payload.email);
  const activity = payload.cnae_fiscal_descricao?.trim() || "Atividade principal nao informada";

  return {
    legalName,
    displayName,
    domain: websiteData.domain,
    website: websiteData.website,
    supplierType: inferSupplierType(payload.cnae_fiscal_descricao),
    segment: inferSegment(payload.cnae_fiscal_descricao),
    subsegment: activity,
    headquartersCity: payload.municipio?.trim() || "",
    headquartersCountry: "Brasil",
    taxId: payload.cnpj,
    primaryContactEmail: payload.email?.trim() || "",
    criticality: "Media",
    integrationType: "API",
    dataClassification: "Dados corporativos e PII",
    accessScope: "Acesso somente leitura",
    hostingModel: "SaaS multi-tenant",
    activeRegions: payload.uf?.trim() || "Brasil",
    servicesProvided: activity,
    countriesOfOperation: "Brasil",
    risk: "Médio Risco",
    source: "brasilapi",
  };
}

async function fetchBrasilApiCnpj(cnpj: string) {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as BrasilApiCnpjResponse;
}

export async function GET(_: Request, { params }: { params: Promise<{ cnpj: string }> }) {
  const { cnpj } = await params;
  const normalized = normalizeCnpj(cnpj);

  if (normalized.length !== 14) {
    return NextResponse.json(
      { error: "CNPJ invalido. Informe 14 digitos." },
      { status: 400 },
    );
  }

  try {
    const brasilApiPayload = await fetchBrasilApiCnpj(normalized);

    if (brasilApiPayload) {
      return NextResponse.json(mapBrasilApiToSupplierSeed(brasilApiPayload));
    }
  } catch {
    // fallback handled below
  }

  const fallback = localFallbackByCnpj[normalized];

  if (fallback) {
    return NextResponse.json(fallback);
  }

  return NextResponse.json(
    { error: "Não foi possível localizar dados para este CNPJ no momento." },
    { status: 404 },
  );
}
