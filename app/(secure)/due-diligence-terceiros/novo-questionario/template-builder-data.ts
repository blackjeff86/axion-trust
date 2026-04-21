export type QuestionType =
  | "multipla-escolha"
  | "texto-longo"
  | "sim-ou-nao"
  | "upload-de-evidencia"
  | "escala-de-maturidade";

export type TemplateConfig = {
  name: string;
  category: string;
  version: string;
  criticality: string;
  objective: string;
};

export type Section = {
  id: string;
  name: string;
  description: string;
};

export type Question = {
  id: string;
  sectionId: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options: string[];
  evidenceHint?: string;
};

export type Rule = {
  id: string;
  sourceQuestionId: string;
  condition: string;
  targetQuestionId: string;
};

export type EvidenceRequirement = {
  id: string;
  item: string;
  format: string;
  required: "Obrigatório" | "Opcional";
  sla: string;
};

export type SavedTemplate = {
  config: TemplateConfig;
  sections: Section[];
  questions: Question[];
  rules: Rule[];
  evidences: EvidenceRequirement[];
  savedAt: string;
  saveMode: "rascunho" | "template";
};

export const STORAGE_KEY = "axion-trust-dd-template-builder";

export const questionTypes: Array<{ type: QuestionType; label: string; icon: string }> = [
  { type: "multipla-escolha", label: "Multipla Escolha", icon: "radio_button_checked" },
  { type: "texto-longo", label: "Texto Longo", icon: "subject" },
  { type: "sim-ou-nao", label: "Sim ou Não", icon: "toggle_on" },
  { type: "upload-de-evidencia", label: "Upload de Evidencia", icon: "upload_file" },
  { type: "escala-de-maturidade", label: "Escala de Maturidade", icon: "linear_scale" },
];

export const initialConfig: TemplateConfig = {
  name: "Due Diligence - Avaliação de Segurança 2026",
  category: "Segurança da Informação",
  version: "v1.0",
  criticality: "Alto",
  objective:
    "Template base para avaliação recorrente de fornecedores, com foco em controles técnicos, privacidade e evidências auditáveis.",
};

export const initialSections: Section[] = [
  {
    id: "s-1",
    name: "Governança e Políticas",
    description: "Perguntas sobre políticas, processos e formalização de controles internos.",
  },
  {
    id: "s-2",
    name: "Controles Tecnicos",
    description: "Perguntas sobre criptografia, resposta a incidentes, monitoramento e evidências técnicas.",
  },
];

export const initialQuestions: Question[] = [
  {
    id: "q-1",
    sectionId: "s-2",
    type: "multipla-escolha",
    title: "Qual o nivel de criptografia adotado para dados em repouso?",
    required: true,
    options: ["AES-256", "AES-128", "RSA-2048", "Outro"],
  },
  {
    id: "q-2",
    sectionId: "s-2",
    type: "sim-ou-nao",
    title: "Sua empresa possui plano formal de resposta a incidentes testado nos ultimos 12 meses?",
    required: true,
    options: ["Sim", "Não"],
    evidenceHint: "Se Sim: solicitar política em PDF. Se Não: solicitar plano de adequação.",
  },
  {
    id: "q-3",
    sectionId: "s-2",
    type: "upload-de-evidencia",
    title: "Anexe o ultimo relatorio de auditoria SOC 2 Type II.",
    required: true,
    options: [],
    evidenceHint: "Formatos aceitos: PDF, DOCX, PNG. Tamanho maximo: 20MB.",
  },
  {
    id: "q-4",
    sectionId: "s-1",
    type: "texto-longo",
    title: "Caso nao exista um plano testado, descreva o plano de remediacao previsto.",
    required: true,
    options: [],
  },
];

export const initialRules: Rule[] = [
  { id: "r-1", sourceQuestionId: "q-2", condition: "Sim", targetQuestionId: "q-3" },
  { id: "r-2", sourceQuestionId: "q-2", condition: "Não", targetQuestionId: "q-4" },
];

export const initialEvidences: EvidenceRequirement[] = [
  { id: "e-1", item: "Política de Privacidade", format: "PDF", required: "Obrigatório", sla: "48h" },
  { id: "e-2", item: "Relatório de Pentest", format: "PDF", required: "Obrigatório", sla: "72h" },
  { id: "e-3", item: "Certificacao ISO 27001", format: "PDF/JPG", required: "Opcional", sla: "5 dias" },
];

export function getQuestionTypeMeta(type: QuestionType) {
  return questionTypes.find((item) => item.type === type) ?? questionTypes[0];
}
