import {
  deriveSubscriptionSnapshot,
  mapPacienteToPortalPayload,
} from "../utils/patientMappers.js";

const patientInclude = {
  assinaturas: {
    orderBy: [{ atualizadoEm: "desc" }, { criadoEm: "desc" }],
    take: 1,
  },
  historicoPesos: {
    orderBy: { dataRegistro: "desc" },
    take: 1,
  },
};

export const createPacienteRepository = (prisma) => {
  const findRawById = (id) =>
    prisma.paciente.findUnique({
      where: { id },
      include: patientInclude,
    });

  const findRawByTelefone = (telefone) =>
    prisma.paciente.findUnique({
      where: { telefone },
      include: patientInclude,
    });

  const findByTelefone = async (telefone) => {
    const paciente = await findRawByTelefone(telefone);
    return mapPacienteToPortalPayload(paciente);
  };

  const findById = async (id) => {
    const paciente = await findRawById(id);
    return mapPacienteToPortalPayload(paciente);
  };

  const findProfileByTelefone = async (telefone) => {
    const paciente = await findRawByTelefone(telefone);
    return mapPacienteToPortalPayload(paciente);
  };

  const findByTelefoneWithApiKey = async (telefone) => {
    const paciente = await findRawByTelefone(telefone);
    return mapPacienteToPortalPayload(paciente);
  };

  const createByTelefone = async ({ telefone, nomeCompleto, senhaHash, apiKey }) => {
    const paciente = await prisma.paciente.create({
      data: {
        telefone,
        nomeCompleto,
        nome: nomeCompleto,
        senhaHash,
        apiKey,
      },
      include: patientInclude,
    });

    return mapPacienteToPortalPayload(paciente);
  };

  const updateProfileByTelefone = async (telefone, data) => {
    const paciente = await prisma.paciente.update({
      where: { telefone },
      data,
      include: patientInclude,
    });

    return mapPacienteToPortalPayload(paciente);
  };

  const updateSubscriptionByTelefone = async (telefone, data) => {
    const paciente = await prisma.paciente.findUnique({
      where: { telefone },
      include: patientInclude,
    });

    if (!paciente) return null;

    const subscription = paciente.assinaturas?.[0] ?? null;
    const nextTipoPlano =
      data.tipoPlano ??
      (data.isSubscriber === true
        ? "premium"
        : data.isSubscriber === false
          ? subscription?.tipoPlano ?? "premium"
          : subscription?.tipoPlano ?? "gratuito");

    const nextStatusPagamento =
      data.statusPagamento ??
      (data.isSubscriber === true
        ? "ativo"
        : data.isSubscriber === false
          ? "cancelado"
          : subscription?.statusPagamento ?? "ativo");

    const payload = {
      pacienteTelefone: telefone,
      pacienteId: paciente.id,
      tipoPlano: nextTipoPlano,
      statusPagamento: nextStatusPagamento,
      dataConversao:
        data.subscriptionStartedAt ??
        data.dataConversao ??
        subscription?.dataConversao ??
        null,
      fimPeriodoAtual: data.fimPeriodoAtual ?? subscription?.fimPeriodoAtual ?? null,
      atualizadoEm: new Date(),
      asaasSubscriptionId:
        data.asaasSubscriptionId ?? subscription?.asaasSubscriptionId ?? null,
      asaasCustomerId: data.asaasCustomerId ?? subscription?.asaasCustomerId ?? null,
    };

    if (!subscription) {
      await prisma.assinatura.create({
        data: {
          ...payload,
          criadoEm: new Date(),
          inicioTesteEm: new Date(),
        },
      });
    } else {
      await prisma.assinatura.update({
        where: { id: subscription.id },
        data: payload,
      });
    }

    const updated = await findRawByTelefone(telefone);
    return mapPacienteToPortalPayload(updated);
  };

  const getSubscriptionEntityByTelefone = async (telefone) => {
    const paciente = await findRawByTelefone(telefone);
    if (!paciente) return null;

    const subscriptionEntity = paciente.assinaturas?.[0] ?? null;
    return {
      paciente,
      subscription: subscriptionEntity,
      snapshot: deriveSubscriptionSnapshot(subscriptionEntity),
    };
  };

  return {
    findRawById,
    findRawByTelefone,
    findById,
    findByTelefone,
    findProfileByTelefone,
    findByTelefoneWithApiKey,
    createByTelefone,
    updateProfileByTelefone,
    updateSubscriptionByTelefone,
    getSubscriptionEntityByTelefone,
  };
};
