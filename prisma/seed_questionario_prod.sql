begin;

insert into public.irya_pilares (nome_pilar, descricao, pontuacao_maxima)
values
  ('Nutrição', null, 15),
  ('Movimento', null, 9),
  ('Sono', null, 15),
  ('Emoções', null, 9),
  ('Conexões', null, 18),
  ('Substâncias Nocivas', null, 9)
on conflict (nome_pilar)
do update set
  descricao = excluded.descricao,
  pontuacao_maxima = excluded.pontuacao_maxima;

delete from public.irya_perguntas
where texto_pergunta in (
  'Quantas vezes na semana você consome frutas e vegetais?',
  'Quantos dias na semana você consumiu alimentos ultraprocessados (como refrigerantes, embutidos, bolachas, doces, salgadinhos)?',
  'Costuma fazer suas refeições nos horários certos, sem pular?',
  'Come por ansiedade ou impulso?',
  'Está conseguindo manter sua hidratação adequada (35 ml × seu peso)?',
  'Quantos minutos de atividade física você realiza por semana (exercícios, caminhadas, alongamentos, dança)?',
  'Você sente disposição física na maior parte dos dias?',
  'Você percebe melhora no humor e no bem-estar após se movimentar?',
  'Está dormindo em média de 7 a 8 horas por noite?',
  'Mantém horários regulares para dormir e acordar?',
  'Costuma evitar telas (celular, TV, computador) antes de dormir?',
  'Acorda descansada e com energia?',
  'Acorda várias vezes durante a noite?',
  'Consegue reservar momentos para relaxar todos os dias?',
  'Usa estratégias para lidar com ansiedade (ex: respiração, pausas conscientes, terapia, oração, meditação)?',
  'Com que frequência você se sente emocionalmente leve e em plenitude?',
  'Você tem metas que te motivam a se cuidar e evoluir?',
  'Costuma praticar gratidão e reconhecer suas conquistas?',
  'Consegue reservar tempo para lazer e autocuidado?',
  'Consegue equilibrar trabalho, vida pessoal e autocuidado?',
  'Você se sente feliz e grata pela sua vida?',
  'Você está conseguindo seguir a Trilha de Florescimento da WHIM e colocando em prática o que aprende?',
  'Com que frequência você consome bebidas alcoólicas?',
  'Com que frequência você fuma (cigarros, narguilé, cigarros eletrônicos ou similares)?',
  'Com que frequência você faz uso de outras substâncias (como drogas ilícitas ou medicamentos sem prescrição)?'
);

with pilares as (
  select id, nome_pilar
  from public.irya_pilares
  where nome_pilar in (
    'Nutrição',
    'Movimento',
    'Sono',
    'Emoções',
    'Conexões',
    'Substâncias Nocivas'
  )
)
insert into public.irya_perguntas (pilar_id, texto_pergunta, ordem, eh_invertida)
select p.id, q.texto_pergunta, q.ordem, q.eh_invertida
from (
  values
    ('Nutrição', 'Quantas vezes na semana você consome frutas e vegetais?', 1, false),
    ('Nutrição', 'Quantos dias na semana você consumiu alimentos ultraprocessados (como refrigerantes, embutidos, bolachas, doces, salgadinhos)?', 2, true),
    ('Nutrição', 'Costuma fazer suas refeições nos horários certos, sem pular?', 3, false),
    ('Nutrição', 'Come por ansiedade ou impulso?', 4, true),
    ('Nutrição', 'Está conseguindo manter sua hidratação adequada (35 ml × seu peso)?', 5, false),
    ('Movimento', 'Quantos minutos de atividade física você realiza por semana (exercícios, caminhadas, alongamentos, dança)?', 1, false),
    ('Movimento', 'Você sente disposição física na maior parte dos dias?', 2, false),
    ('Movimento', 'Você percebe melhora no humor e no bem-estar após se movimentar?', 3, false),
    ('Sono', 'Está dormindo em média de 7 a 8 horas por noite?', 1, false),
    ('Sono', 'Mantém horários regulares para dormir e acordar?', 2, false),
    ('Sono', 'Costuma evitar telas (celular, TV, computador) antes de dormir?', 3, false),
    ('Sono', 'Acorda descansada e com energia?', 4, false),
    ('Sono', 'Acorda várias vezes durante a noite?', 5, true),
    ('Emoções', 'Consegue reservar momentos para relaxar todos os dias?', 1, false),
    ('Emoções', 'Usa estratégias para lidar com ansiedade (ex: respiração, pausas conscientes, terapia, oração, meditação)?', 2, false),
    ('Emoções', 'Com que frequência você se sente emocionalmente leve e em plenitude?', 3, false),
    ('Conexões', 'Você tem metas que te motivam a se cuidar e evoluir?', 1, false),
    ('Conexões', 'Costuma praticar gratidão e reconhecer suas conquistas?', 2, false),
    ('Conexões', 'Consegue reservar tempo para lazer e autocuidado?', 3, false),
    ('Conexões', 'Consegue equilibrar trabalho, vida pessoal e autocuidado?', 4, false),
    ('Conexões', 'Você se sente feliz e grata pela sua vida?', 5, false),
    ('Conexões', 'Você está conseguindo seguir a Trilha de Florescimento da WHIM e colocando em prática o que aprende?', 6, false),
    ('Substâncias Nocivas', 'Com que frequência você consome bebidas alcoólicas?', 1, true),
    ('Substâncias Nocivas', 'Com que frequência você fuma (cigarros, narguilé, cigarros eletrônicos ou similares)?', 2, true),
    ('Substâncias Nocivas', 'Com que frequência você faz uso de outras substâncias (como drogas ilícitas ou medicamentos sem prescrição)?', 3, true)
) as q(nome_pilar, texto_pergunta, ordem, eh_invertida)
join pilares p on p.nome_pilar = q.nome_pilar;

commit;
