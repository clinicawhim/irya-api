const INACTIVE_SUBSCRIPTION_STATUS = new Set(["cancelado", "reembolsado"]);

export const normalizeDigitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

export const getLatestSubscription = (subscriptions = []) =>
  Array.isArray(subscriptions) && subscriptions.length > 0 ? subscriptions[0] : null;

export const getLatestWeightRecord = (historicoPesos = []) =>
  Array.isArray(historicoPesos) && historicoPesos.length > 0 ? historicoPesos[0] : null;

export const deriveSubscriptionSnapshot = (subscription) => {
  if (!subscription) {
    return {
      isSubscriber: false,
      subscriptionStartedAt: null,
      subscriptionCanceledAt: null,
      subscriptionStatus: null,
      subscriptionPlan: null,
    };
  }

  const status = String(subscription.statusPagamento ?? "").toLowerCase();
  const plan = String(subscription.tipoPlano ?? "").toLowerCase();
  const isSubscriber = plan !== "gratuito" && !INACTIVE_SUBSCRIPTION_STATUS.has(status);

  return {
    isSubscriber,
    subscriptionStartedAt:
      subscription.dataConversao ?? subscription.criadoEm ?? subscription.inicioTesteEm ?? null,
    subscriptionCanceledAt: INACTIVE_SUBSCRIPTION_STATUS.has(status)
      ? subscription.atualizadoEm ?? subscription.fimPeriodoAtual ?? null
      : null,
    subscriptionStatus: subscription.statusPagamento ?? null,
    subscriptionPlan: subscription.tipoPlano ?? null,
  };
};

export const mapPacienteToPortalPayload = (paciente) => {
  if (!paciente) return null;

  const subscription = deriveSubscriptionSnapshot(
    getLatestSubscription(paciente.assinaturas),
  );
  const latestWeight = getLatestWeightRecord(paciente.historicoPesos);

  return {
    id: paciente.id,
    telefone: paciente.telefone,
    nomeCompleto: paciente.nomeCompleto ?? paciente.nome ?? paciente.apelido ?? null,
    nome: paciente.nome ?? paciente.nomeCompleto ?? paciente.apelido ?? null,
    alturaM: latestWeight?.alturaM ?? null,
    dataCadastro: paciente.dataCadastro ?? paciente.dataCriacao ?? null,
    apiKey: paciente.apiKey ?? null,
    cpf: paciente.cpf ?? null,
    email: paciente.email ?? null,
    ...subscription,
  };
};
