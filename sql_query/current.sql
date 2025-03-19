select * from atendimentos;


-- -- Inserindo um posto de teste
-- INSERT INTO postos (nome) VALUES ('Posto MQTT') RETURNING id;

-- -- Inserindo uma bomba associada ao posto de teste
-- INSERT INTO bombas (posto_id) VALUES (1) RETURNING id;

-- -- Inserindo um bico associado à bomba de teste
-- INSERT INTO bicos (bomba_id) VALUES (2) RETURNING id;

select * from bicos;

select * from atendimentos;