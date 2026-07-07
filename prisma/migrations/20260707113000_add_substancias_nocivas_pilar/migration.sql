alter table "irya_dados_mev"
  add column if not exists "score_substancias_nocivas" integer;

alter table "irya_dados_mev"
  drop constraint if exists "irya_dados_mev_score_nutricao_check";

alter table "irya_dados_mev"
  drop constraint if exists "irya_dados_mev_score_substancias_nocivas_check";

alter table "irya_dados_mev"
  add constraint "irya_dados_mev_score_nutricao_check"
  check ((("score_nutricao" >= 0) and ("score_nutricao" <= 15)));

alter table "irya_dados_mev"
  add constraint "irya_dados_mev_score_substancias_nocivas_check"
  check ((("score_substancias_nocivas" >= 0) and ("score_substancias_nocivas" <= 9)));
