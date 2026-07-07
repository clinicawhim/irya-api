import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questionarioData = [
  {
    nome: "Nutrição",
    maximo: 15,
    perguntas: [
      {
        texto: "Quantas vezes na semana você consome frutas e vegetais?",
        ordem: 1,
        invertida: false,
      },
      {
        texto:
          "Quantos dias na semana você consumiu alimentos ultraprocessados (como refrigerantes, embutidos, bolachas, doces, salgadinhos)?",
        ordem: 2,
        invertida: true,
      },
      {
        texto: "Costuma fazer suas refeições nos horários certos, sem pular?",
        ordem: 3,
        invertida: false,
      },
      { texto: "Come por ansiedade ou impulso?", ordem: 4, invertida: true },
      {
        texto:
          "Está conseguindo manter sua hidratação adequada (35 ml × seu peso)?",
        ordem: 5,
        invertida: false,
      },
    ],
  },
  {
    nome: "Movimento",
    maximo: 9,
    perguntas: [
      {
        texto:
          "Quantos minutos de atividade física você realiza por semana (exercícios, caminhadas, alongamentos, dança)?",
        ordem: 1,
        invertida: false,
      },
      {
        texto: "Você sente disposição física na maior parte dos dias?",
        ordem: 2,
        invertida: false,
      },
      {
        texto:
          "Você percebe melhora no humor e no bem-estar após se movimentar?",
        ordem: 3,
        invertida: false,
      },
    ],
  },
  {
    nome: "Sono",
    maximo: 15,
    perguntas: [
      {
        texto: "Está dormindo em média de 7 a 8 horas por noite?",
        ordem: 1,
        invertida: false,
      },
      {
        texto: "Mantém horários regulares para dormir e acordar?",
        ordem: 2,
        invertida: false,
      },
      {
        texto:
          "Costuma evitar telas (celular, TV, computador) antes de dormir?",
        ordem: 3,
        invertida: false,
      },
      { texto: "Acorda descansada e com energia?", ordem: 4, invertida: false },
      {
        texto: "Acorda várias vezes durante a noite?",
        ordem: 5,
        invertida: true,
      },
    ],
  },
  {
    nome: "Emoções",
    maximo: 9,
    perguntas: [
      {
        texto: "Consegue reservar momentos para relaxar todos os dias?",
        ordem: 1,
        invertida: false,
      },
      {
        texto:
          "Usa estratégias para lidar com ansiedade (ex: respiração, pausas conscientes, terapia, oração, meditação)?",
        ordem: 2,
        invertida: false,
      },
      {
        texto:
          "Com que frequência você se sente emocionalmente leve e em plenitude?",
        ordem: 3,
        invertida: false,
      },
    ],
  },
  {
    nome: "Conexões",
    maximo: 18,
    perguntas: [
      {
        texto: "Você tem metas que te motivam a se cuidar e evoluir?",
        ordem: 1,
        invertida: false,
      },
      {
        texto: "Costuma praticar gratidão e reconhecer suas conquistas?",
        ordem: 2,
        invertida: false,
      },
      {
        texto: "Consegue reservar tempo para lazer e autocuidado?",
        ordem: 3,
        invertida: false,
      },
      {
        texto: "Consegue equilibrar trabalho, vida pessoal e autocuidado?",
        ordem: 4,
        invertida: false,
      },
      {
        texto: "Você se sente feliz e grata pela sua vida?",
        ordem: 5,
        invertida: false,
      },
      {
        texto:
          "Você está conseguindo seguir a Trilha de Florescimento da WHIM e colocando em prática o que aprende?",
        ordem: 6,
        invertida: false,
      },
    ],
  },
  {
    nome: "Substâncias Nocivas",
    maximo: 9,
    perguntas: [
      {
        texto: "Com que frequência você consome bebidas alcoólicas?",
        ordem: 1,
        invertida: true,
      },
      {
        texto:
          "Com que frequência você fuma (cigarros, narguilé, cigarros eletrônicos ou similares)?",
        ordem: 2,
        invertida: true,
      },
      {
        texto:
          "Com que frequência você faz uso de outras substâncias (como drogas ilícitas ou medicamentos sem prescrição)?",
        ordem: 3,
        invertida: true,
      },
    ],
  },
];

async function main() {
  console.log(`Iniciando a semeadura de dados...`);
  for (const pilarData of questionarioData) {
    const pilar = await prisma.pilar.create({
      data: {
        nomePilar: pilarData.nome,
        pontuacaoMaxima: pilarData.maximo,
      },
    });

    console.log(`Pilar criado: ${pilar.nomePilar} (ID: ${pilar.id})`);

    for (const perguntaData of pilarData.perguntas) {
      await prisma.pergunta.create({
        data: {
          pilarId: pilar.id,
          textoPergunta: perguntaData.texto,
          ordem: perguntaData.ordem,
          ehInvertida: perguntaData.invertida,
        },
      });
    }
  }

  console.log(`Semeadura concluída com sucesso.`);
}

main()
  .catch((e) => {
    console.error("Erro durante o seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
