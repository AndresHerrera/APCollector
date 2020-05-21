CREATE TABLE encuestas
(
     gid serial,	
     id character varying,
     uid character varying,
     uname character varying,
     created character varying,
     datos character varying,
    CONSTRAINT encuestas_pkey PRIMARY KEY (gid)
);



CREATE VIEW encuestas_view AS
SELECT p.gid, p.id, p.uid, p.uname, p.created, p.lat::double precision, p.lon::double precision, 
ST_SetSRID(st_makepoint(p.lon::double precision, p.lat::double precision ),4326) as the_geom, p.datos 
FROM 
(
    SELECT gid, id, uid, uname, created,  datos::json->>'latitude' as lat, datos::json->>'longitude' as lon, datos   FROM encuestas
)as p;