<?php 
   include('cfg/configuracion.php');
   session_start();
   if(!isset($_POST['peticion']))
   {
	$_POST['peticion'] = "peticion";
   }
   if(!isset($_POST['parametros']))
   {
	$_POST['parametros'] = "parametros";
   }
   $peticion = $_POST['peticion'];
   $parametros = $_POST['parametros'];
   
   switch($peticion)
   {
		case 'get-data-from-view':
		{
			$sql="SELECT row_to_json(fc)
            FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
            FROM (SELECT 'Feature' As type
               , ST_AsGeoJSON(lg.the_geom)::json As geometry
               , row_to_json((SELECT l FROM (SELECT gid , id, uid, uname, created, datos  ) As l
                 )) As properties
              FROM encuestas_view As lg  where ST_IsValid(the_geom) ) As f )  As fc;";
   
			$query = pg_query($dbcon,$sql);
			$row = pg_fetch_row($query);
			echo $row[0];
			break;
		}
   }
?>