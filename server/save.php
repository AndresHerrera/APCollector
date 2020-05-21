<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

include('cfg/configuracion.php');

if(isset($_POST['msg'])){

	$data=$_POST['msg'];
	$json=json_decode($data, true);

	$counting = count($json);
	$err=false;
	for ($i = 0; $i < $counting; $i++){
		$id=$json['row'.$i]['id'];
		$uid=$json['row'.$i]['uid'];
		$uname=$json['row'.$i]['uname'];
		$created=$json['row'.$i]['created'];
		$datos=$json['row'.$i]['datos'];
		
		$sql = "INSERT INTO public.encuestas(
            id, uid, uname, created, datos)
    VALUES ('$id', '$uid', '$uname', '$created', '$datos');";

		// Call to DB
		$query = pg_query($dbcon,$sql);
		$row = pg_fetch_row($query);
		if($query)
		{
			$err=false;
		}else
		{
			$err=true;
		}
	}
	if($err){
		echo 'error';
	}else{
		echo 'success';
	}
	exit();
}else{
	exit();
}


?>
