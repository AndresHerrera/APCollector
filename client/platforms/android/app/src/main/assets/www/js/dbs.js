// Create database
var url="http://54.186.237.120/APCollector/server";
//var url="http://localhost/APCollector/server";
function initDB(){
      try {
          if (!window.openDatabase) {
              alert("You will be unable to effectively use this application.","Database Unsupported","Okay");
          } else {
              var shortName = 'agro_gis';
              var version = 1;
              var displayName = 'agro_gis';
              var maxSize = 5 * 1024 * 1024; // in bytes (50mb)
              db = openDatabase(shortName, version, displayName, maxSize);
              createTables();
			  setInterval(function(){datatoSend();},30*1000);
			  setInterval(function(){checkNot();},3*60*1000);
          }
      } catch(e) {
          alertPop("Please load this page in Safari or Google Chrome. <br><br> If you continue you will not be able to save any surveys.","Database Error");
      }
}
// Create tables in database
function createTables(){
      db.transaction(
         function (transaction) {
            transaction.executeSql('CREATE TABLE IF NOT EXISTS encuestas (id,uid,uname,created,datos,sent);',
			 [], dbSuccess, dbError);
         }
      );
}
function dbSuccess(transaction, results){
	notSent();
}
function dbError(transaction, error) {
	console.log(error.message);
}
function addSurvey(s){// This takes an input 'hours', which is the time they selected and saves it into the database
		db.transaction(
         function (transaction) { // -1 means N/A
       transaction.executeSql(s,
			 [], addedSurvey, errorPop('Se produjo un error inesperado al guardar el formulario.'));
         });
}
function addedSurvey(transaction, results){
	alertPop('Gracias por completar el formulario.',"APCollector");
	resetForm();
	setTimeout(function(){notSent();},4000);
	datatoSend();
}
function errorPop(msg){
	return function(t,r){
		alertPop(msg,"Error no identificado");
	}
}
function notSent(){
		db.transaction(
         function (transaction) {
            transaction.executeSql('SELECT * FROM encuestas WHERE sent=0',
			 [], notSentt, dbError); //then it runs sendData
		 }
		 );
}
function checkNot(){
	nots=true;
	notSent();
}
nots=false;
function notSentt(t,r){
	if(r.rows.length>0){
		_('saved').innerHTML='Existe ( '+r.rows.length+' ) formulario(s) que no han sido enviado(s) al servidor.';
		$("#counter_s").show();
		$("#uploadbtn").show();
		$("#counter_s").html(r.rows.length);
		if(nots){
			alertPop('Existe ( '+r.rows.length+' ) formulario(s) que no han sido enviado(s) al servidor. <br><br> Aseg&uacute;rese de que su dispositivo est&eacute; conectado a internet. <br><br> Los formularios se respaldan cada 30 segundos, pero se pueden forzar en la p&aacute;gina Configuraci&oacute;n.','Respaldo en Servidor');
		}
		nots=false;
	}else{
		_('saved').innerHTML='<i class="ui-icon-fa ui-icon-fa-check"></i> Todos los formularios registrados se han guardado correctamente.';
		$("#uploadbtn").hide();
		$("#counter_s").hide();
	}
}
var sett=false;
function datatoSend(){
		db.transaction(
         function (transaction) {
            transaction.executeSql('SELECT * FROM encuestas WHERE sent=0',
			 [], sendData, dbError); //then it runs sendData
		 }
		 );
}
function sendData(transaction,result){ //we put in these parameters because we need the results from datatoSend();
		if(result.rows.length >0){ //so if there is rows more than 0 than run everything below if not do nothing.
			var ent={}; // create an empty object (different type of array)
			for ( var i = 0; i < result.rows.length; i++){ // for i starting from 0 and i always less than 2 do everything inside the brackets and each time you finish add 1 to i. once i is 2 or bigger stop.
					ent['row'+i] = {
						id:result.rows.item(i).id,
						uid:result.rows.item(i).uid,
						uname:result.rows.item(i).uname,
						created:result.rows.item(i).created,
						datos:result.rows.item(i).datos
					};
			}
			var data=JSON.stringify(ent);
			$.ajax({
				type: "POST",
				url: url+"/save.php",
				data: "msg="+data,
				success: function (r) {
					console.log(r);
				   if(r=="success"){ //this checks to see if it sent ok to the server and if it did it will delete the rows it sent
					  db.transaction(
						function (transaction) {
						transaction.executeSql('update encuestas set sent=1', //this is the search it does to make sure it deleted everything ok
						[], dbSuccess, dbError);
						 }
						);
						if(sett){
							alertPop('Se han guardado todos los formularios recopilados por este dispositivo.',"Formulario respaldado con exito !");
						}
						sett=false;
					}else{
						if(sett){
							alertPop('Se produjo un error al hacer una copia de seguridad de los formularios recopilados por este dispositivo. <br><br>  Aseg&uacute;rese de que el dispositivo est&eacute; conectado a internet. <br><br> Si este problema persiste, actualice la p&aacute;gina.',"Error");
						}
						sett=false;
					}

				},
				error: function () {
						if(sett){
							alertPop('Se produjo un error al hacer una copia de seguridad de los formularios recopilados por este dispositivo. <br><br>  Aseg&uacute;rese de que el dispositivo est&eacute; conectado a internet. <br><br>  Si este problema persiste, actualice la p&aacute;gina.',"Error");
						}
						sett=false;
				}
			});
		}else{
			if(sett){
				alertPop('Se han guardado todos los formularios recopilados por este dispositivo.',"Formulario respaldado Exitosamente");
			}
			sett=false;
		}
}
