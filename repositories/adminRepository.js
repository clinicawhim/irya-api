export const createAdminRepository = (prisma) => {
  const getOverview = async () => {
    const [totalPacientes, totalQuestionarios, totalRespostas, assinaturasAtivas] =
      await Promise.all([
        prisma.paciente.count(),
        prisma.questionarioConcluido.count(),
        prisma.answer.count(),
        prisma.assinatura.findMany({
          where: {
            tipoPlano: { not: "gratuito" },
            statusPagamento: { notIn: ["cancelado", "reembolsado"] },
          },
          distinct: ["pacienteId"],
          select: { pacienteId: true },
        }),
      ]);

    return {
      totalPacientes,
      totalQuestionarios,
      totalRespostas,
      totalAssinantesAtivos: assinaturasAtivas.length,
    };
  };

  const listPacientes = () =>
    prisma.paciente.findMany({
      orderBy: [{ dataCadastro: "desc" }, { dataCriacao: "desc" }],
      include: {
        assinaturas: {
          orderBy: [{ atualizadoEm: "desc" }, { criadoEm: "desc" }],
          take: 1,
        },
        historicoPesos: {
          orderBy: { dataRegistro: "desc" },
          take: 1,
        },
        _count: {
          select: {
            questionariosConcluidos: true,
            answers: true,
            historicoPesos: true,
          },
        },
      },
    });

  const listQuestionariosConcluidos = () =>
    prisma.questionarioConcluido.findMany({
      orderBy: { dataConclusao: "desc" },
      include: {
        paciente: {
          select: {
            telefone: true,
            nomeCompleto: true,
            nome: true,
          },
        },
        pontuacoes: {
          include: {
            pilar: {
              select: {
                nomePilar: true,
                pontuacaoMaxima: true,
              },
            },
          },
          orderBy: { pilarId: "asc" },
        },
      },
    });

  const listPontuacoes = () =>
    prisma.pontuacaoPorPilar.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        pilar: {
          select: {
            nomePilar: true,
            pontuacaoMaxima: true,
          },
        },
        questionarioConcluido: {
          select: {
            id: true,
            dataConclusao: true,
            pacienteTelefone: true,
          },
        },
      },
      take: 500,
    });

  const getPacienteDetalhes = (phone) =>
    prisma.paciente.findUnique({
      where: { telefone: phone },
      include: {
        assinaturas: {
          orderBy: [{ atualizadoEm: "desc" }, { criadoEm: "desc" }],
        },
        historicoPesos: {
          orderBy: { dataRegistro: "desc" },
          take: 24,
        },
        questionariosConcluidos: {
          orderBy: { dataConclusao: "desc" },
          take: 24,
          include: {
            pontuacoes: {
              include: {
                pilar: {
                  select: {
                    nomePilar: true,
                    pontuacaoMaxima: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          orderBy: { createdAt: "desc" },
          take: 200,
        },
      },
    });

  const deletePacienteByPhone = async (phone) => {
    const paciente = await prisma.paciente.findUnique({
      where: { telefone: phone },
      select: { id: true, telefone: true },
    });

    if (!paciente) return null;

    await prisma.$transaction(async (tx) => {
      const questionarios = await tx.questionarioConcluido.findMany({
        where: { pacienteTelefone: phone },
        select: { id: true },
      });

      const questionarioIds = questionarios.map((questionario) => questionario.id);

      await tx.answer.deleteMany({
        where: { pacienteTelefone: phone },
      });

      if (questionarioIds.length > 0) {
        await tx.pontuacaoPorPilar.deleteMany({
          where: {
            questionarioConcluidoId: { in: questionarioIds },
          },
        });
      }

      await tx.questionarioConcluido.deleteMany({
        where: { pacienteTelefone: phone },
      });

      await tx.historicoPeso.deleteMany({
        where: { pacienteTelefone: phone },
      });

      await tx.assinatura.deleteMany({
        where: { pacienteTelefone: phone },
      });

      await tx.dadosMev.deleteMany({
        where: { pacienteTelefone: phone },
      });

      await tx.paciente.delete({
        where: { id: paciente.id },
      });
    });

    return { telefone: phone };
  };

  return {
    getOverview,
    listPacientes,
    listQuestionariosConcluidos,
    listPontuacoes,
    getPacienteDetalhes,
    deletePacienteByPhone,
  };
};
